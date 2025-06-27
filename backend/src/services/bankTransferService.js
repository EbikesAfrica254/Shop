// src/services/bankTransferService.js
import { db } from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

class BankTransferService {
  constructor() {
    this.setupFileUpload();
  }

  setupFileUpload() {
    // Configure multer for proof of payment uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = 'uploads/payments';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `proof_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
        }
      }
    });
  }

  async initiateBankTransfer(orderData) {
    try {
      console.log('🏦 Initiating bank transfer...');
      
      const { orderId, customerInfo } = orderData;
      
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      // Generate unique reference number
      const referenceNumber = `BT${Date.now()}${orderId}`;

      const transferData = {
        order_id: orderId,
        reference_number: referenceNumber,
        amount: orderData.amount,
        status: 'pending'
      };

      const [result] = await db.query(
        'INSERT INTO bank_transfers SET ?',
        [transferData]
      );

      // Send bank details email
      await this.sendBankDetailsEmail(orderData, referenceNumber);

      console.log('✅ Bank transfer initiated successfully');
      
      return {
        success: true,
        message: 'Bank transfer initiated. Please check your email for bank details.',
        data: {
          transferId: result.insertId,
          referenceNumber: referenceNumber,
          bankDetails: this.getBankDetails()
        }
      };

    } catch (error) {
      console.error('💥 Bank transfer initiation failed:', error);
      throw new Error(`Bank transfer failed: ${error.message}`);
    }
  }

  getBankDetails() {
    return {
      bankName: process.env.BANK_NAME || 'KCB Bank Kenya',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
      accountName: process.env.BANK_ACCOUNT_NAME || 'E-Bikes Platform Ltd',
      branchCode: process.env.BANK_BRANCH_CODE || '001',
      swiftCode: process.env.BANK_SWIFT_CODE || 'KCBLKENX'
    };
  }

  async sendBankDetailsEmail(orderData, referenceNumber) {
    try {
      const { sendBankTransferDetailsEmail } = await import('./emailService.js');
      
      const bankDetails = this.getBankDetails();
      
      const transferDetails = {
        referenceNumber: referenceNumber,
        orderId: orderData.orderId,
        amount: orderData.amount,
        customerName: orderData.customerInfo.name,
        bankDetails: bankDetails,
        instructions: [
          'Transfer the exact amount to the bank account above',
          'Use the reference number in your transfer description',
          'Upload proof of payment using the link in this email',
          'Payment will be verified within 24 hours'
        ]
      };

      const emailAddress = orderData.customerInfo.email;
      if (!emailAddress) {
        console.log('⚠️ No email address found for bank details');
        return false;
      }

      await sendBankTransferDetailsEmail(emailAddress, transferDetails);
      return true;

    } catch (error) {
      console.error('📧 Bank details email failed:', error);
      return false;
    }
  }

  async submitProofOfPayment(transferData, file) {
    try {
      console.log('📄 Submitting proof of payment...');
      
      const { referenceNumber, bankName, accountNumber, transferDate, accountName } = transferData;
      
      if (!referenceNumber || !file) {
        throw new Error('Reference number and proof file are required');
      }

      // Find the bank transfer record
      const [transfers] = await db.query(
        'SELECT * FROM bank_transfers WHERE reference_number = ?',
        [referenceNumber]
      );

      if (transfers.length === 0) {
        throw new Error('Bank transfer record not found');
      }

      const transfer = transfers[0];

      // Update transfer with proof details
      const updateData = {
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        transfer_date: transferDate,
        proof_of_payment: file.filename,
        status: 'submitted',
        updated_at: new Date()
      };

      await db.query(
        'UPDATE bank_transfers SET ? WHERE reference_number = ?',
        [updateData, referenceNumber]
      );

      // Send confirmation email
      await this.sendProofSubmissionConfirmation(transfer.order_id, referenceNumber);

      // Notify admin
      await this.notifyAdminOfProofSubmission(transfer.order_id, referenceNumber);

      console.log('✅ Proof of payment submitted successfully');
      
      return {
        success: true,
        message: 'Proof of payment submitted successfully. Payment will be verified within 24 hours.',
        data: {
          referenceNumber: referenceNumber,
          status: 'submitted',
          fileName: file.filename
        }
      };

    } catch (error) {
      console.error('💥 Proof submission failed:', error);
      throw new Error(`Proof submission failed: ${error.message}`);
    }
  }

  async verifyBankTransfer(transferId, verificationData, adminUserId) {
    try {
      console.log('✅ Verifying bank transfer...');
      
      const { verified, notes } = verificationData;
      
      const [transfers] = await db.query(
        'SELECT * FROM bank_transfers WHERE id = ?',
        [transferId]
      );

      if (transfers.length === 0) {
        throw new Error('Bank transfer not found');
      }

      const transfer = transfers[0];

      const updateData = {
        verified: verified,
        verified_by: adminUserId,
        verified_at: new Date(),
        verification_notes: notes,
        status: verified ? 'verified' : 'rejected',
        rejection_reason: verified ? null : notes
      };

      await db.query(
        'UPDATE bank_transfers SET ? WHERE id = ?',
        [updateData, transferId]
      );

      if (verified) {
        // Update order payment status
        await db.query(
          'UPDATE orders SET payment_status = ? WHERE id = ?',
          ['paid', transfer.order_id]
        );

        // Generate receipt
        await this.generateBankTransferReceipt(transfer.order_id, transfer);
      }

      // Send notification to customer
      await this.sendVerificationNotification(transfer.order_id, verified, notes);

      console.log(`✅ Bank transfer ${verified ? 'verified' : 'rejected'} successfully`);
      
      return {
        success: true,
        message: `Bank transfer ${verified ? 'verified' : 'rejected'} successfully`,
        data: updateData
      };

    } catch (error) {
      console.error('💥 Bank transfer verification failed:', error);
      throw new Error(`Verification failed: ${error.message}`);
    }
  }

  async generateBankTransferReceipt(orderId, transfer) {
    try {
      console.log('🧾 Generating bank transfer receipt...');

      const receiptNumber = `RCP-BT-${Date.now()}-${orderId}`;

      const [orders] = await db.query(
        `SELECT o.*, u.email as user_email 
         FROM orders o 
         LEFT JOIN users u ON o.user_id = u.id 
         WHERE o.id = ?`,
        [orderId]);

     if (orders.length === 0) {
       throw new Error('Order not found');
     }

     const order = orders[0];

     const [orderItems] = await db.query(
       'SELECT * FROM order_items WHERE order_id = ?',
       [orderId]
     );

     const receiptData = {
       receipt_number: receiptNumber,
       order_id: orderId,
       payment_type: 'bank_transfer',
       transaction_id: transfer.id,
       amount: transfer.amount,
       payment_date: transfer.verified_at || new Date(),
       receipt_data: JSON.stringify({
         order: order,
         items: orderItems,
         bankTransfer: transfer
       })
     };

     const [result] = await db.query(
       'INSERT INTO payment_receipts SET ?',
       [receiptData]
     );

     const emailSent = await this.sendBankTransferReceiptEmail(order, orderItems, transfer, receiptNumber);

     if (emailSent) {
       await db.query(
         'UPDATE payment_receipts SET email_sent = TRUE, email_sent_at = NOW() WHERE id = ?',
         [result.insertId]
       );
     }

     console.log('✅ Bank transfer receipt generated and email sent');
     return { receiptNumber, emailSent };

   } catch (error) {
     console.error('💥 Bank transfer receipt generation failed:', error);
     throw error;
   }
 }

 async sendBankTransferReceiptEmail(order, orderItems, transfer, receiptNumber) {
   try {
     const { sendPaymentReceiptEmail } = await import('./emailService.js');
     
     const receiptDetails = {
       receiptNumber: receiptNumber,
       orderId: order.order_number,
       customerName: order.customer_name,
       paymentMethod: 'Bank Transfer',
       bankReference: transfer.reference_number,
       amount: transfer.amount,
       paymentDate: transfer.verified_at,
       items: orderItems.map(item => ({
         name: item.item_name,
         quantity: item.quantity,
         price: item.total_price
       })),
       order: order,
       bankDetails: {
         bankName: transfer.bank_name,
         accountNumber: transfer.account_number,
         transferDate: transfer.transfer_date
       }
     };

     const emailAddress = order.user_email || order.customer_email;
     if (!emailAddress) {
       console.log('⚠️ No email address found for receipt');
       return false;
     }

     await sendPaymentReceiptEmail(emailAddress, receiptDetails);
     return true;

   } catch (error) {
     console.error('📧 Bank transfer receipt email failed:', error);
     return false;
   }
 }

 async sendProofSubmissionConfirmation(orderId, referenceNumber) {
   try {
     const { sendBankTransferConfirmationEmail } = await import('./emailService.js');
     
     const [orders] = await db.query(
       `SELECT o.*, u.email as user_email 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        WHERE o.id = ?`,
       [orderId]
     );

     if (orders.length === 0) return false;

     const order = orders[0];
     const emailAddress = order.user_email || order.customer_email;
     
     if (!emailAddress) return false;

     await sendBankTransferConfirmationEmail(emailAddress, {
       customerName: order.customer_name,
       referenceNumber: referenceNumber,
       orderId: order.order_number
     });

     return true;
   } catch (error) {
     console.error('📧 Proof submission confirmation email failed:', error);
     return false;
   }
 }

 async notifyAdminOfProofSubmission(orderId, referenceNumber) {
   try {
     const { sendNotificationEmail } = await import('./emailService.js');
     
     const adminEmail = process.env.ADMIN_EMAIL || 'admin@ebikes.com';
     
     await sendNotificationEmail(
       adminEmail,
       'New Bank Transfer Proof Submitted',
       `A customer has submitted proof of payment for bank transfer.`,
       {
         'Reference Number': referenceNumber,
         'Order ID': orderId,
         'Submitted At': new Date().toLocaleString(),
         'Action Required': 'Please verify the payment in the admin panel'
       }
     );

     return true;
   } catch (error) {
     console.error('📧 Admin notification failed:', error);
     return false;
   }
 }

 async sendVerificationNotification(orderId, verified, notes) {
   try {
     const { sendBankTransferVerificationEmail } = await import('./emailService.js');
     
     const [orders] = await db.query(
       `SELECT o.*, u.email as user_email 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        WHERE o.id = ?`,
       [orderId]
     );

     if (orders.length === 0) return false;

     const order = orders[0];
     const emailAddress = order.user_email || order.customer_email;
     
     if (!emailAddress) return false;

     await sendBankTransferVerificationEmail(emailAddress, {
       customerName: order.customer_name,
       orderId: order.order_number,
       verified: verified,
       notes: notes,
       verificationDate: new Date()
     });

     return true;
   } catch (error) {
     console.error('📧 Verification notification email failed:', error);
     return false;
   }
 }

 async getBankTransferStatus(referenceNumber) {
   try {
     const [transfers] = await db.query(
       `SELECT bt.*, o.order_number, o.customer_name 
        FROM bank_transfers bt 
        JOIN orders o ON bt.order_id = o.id 
        WHERE bt.reference_number = ?`,
       [referenceNumber]
     );

     if (transfers.length === 0) {
       return { success: false, message: 'Bank transfer not found' };
     }

     return {
       success: true,
       transfer: transfers[0]
     };

   } catch (error) {
     console.error('💥 Get bank transfer status failed:', error);
     return { success: false, message: 'Failed to get transfer status' };
   }
 }

 async getAllPendingTransfers() {
   try {
     const [transfers] = await db.query(
       `SELECT bt.*, o.order_number, o.customer_name, o.customer_email 
        FROM bank_transfers bt 
        JOIN orders o ON bt.order_id = o.id 
        WHERE bt.status IN ('submitted', 'pending') 
        ORDER BY bt.created_at DESC`
     );

     return {
       success: true,
       transfers: transfers
     };

   } catch (error) {
     console.error('💥 Get pending transfers failed:', error);
     return { success: false, message: 'Failed to get pending transfers' };
   }
 }
}

export default new BankTransferService();