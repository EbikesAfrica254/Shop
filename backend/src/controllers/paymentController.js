// src/controllers/paymentController.js
import { db } from '../config/db.js';
import mpesaService from '../services/mpesaService.js';
import crypto from 'crypto';

// ================================
// ORDER VALIDATION
// ================================

export const validateOrder = async (req, res) => {
  try {
    console.log('🔍 Validating order...');
    const orderData = req.body;

    // Validate required fields
    if (!orderData.customer || !orderData.payment || !orderData.items) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order data: customer, payment, items'
      });
    }

    // Generate temporary order reference
    const tempOrderRef = `TEMP-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    // Calculate totals (server-side validation)
    const itemsTotal = orderData.items.reduce((sum, item) => {
      const itemPrice = item.discount ? (item.price - item.discount_amount) : item.price;
      return sum + (itemPrice * item.quantity);
    }, 0);

    const deliveryCost = orderData.delivery.cost || 0;
    const totalAmount = itemsTotal + deliveryCost;
    const paymentRequired = orderData.payment.total_deposit_due;

    // Store temporary order data for payment processing
    const tempOrderData = {
      temp_ref: tempOrderRef,
      customer_data: JSON.stringify(orderData.customer),
      delivery_data: JSON.stringify(orderData.delivery),
      payment_data: JSON.stringify(orderData.payment),
      items_data: JSON.stringify(orderData.items),
      notes: orderData.notes,
      calculated_total: totalAmount,
      payment_required: paymentRequired,
      status: 'pending_payment',
      created_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    };

    await db.query(
      'INSERT INTO temp_orders SET ?',
      [tempOrderData]
    );

    console.log('✅ Order validated and temp ref created:', tempOrderRef);

    res.json({
      success: true,
      temp_order_ref: tempOrderRef,
      payment_required: paymentRequired,
      total_amount: totalAmount,
      message: 'Order validated successfully'
    });

  } catch (error) {
    console.error('❌ Order validation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Order validation failed',
      error: error.message
    });
  }
};

// ================================
// M-PESA PAYMENT INITIATION
// ================================

export const initiateMpesaPayment = async (req, res) => {
  try {
    console.log('🚀 Initiating M-Pesa payment...');
    const { tempOrderRef, phoneNumber, amount, accountReference, transactionDesc } = req.body;

    // Validate input
    if (!tempOrderRef || !phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tempOrderRef, phoneNumber, amount'
      });
    }

    // Get temp order data
    const [tempOrders] = await db.query(
      'SELECT * FROM temp_orders WHERE temp_ref = ? AND status = "pending_payment" AND expires_at > NOW()',
      [tempOrderRef]
    );

    if (tempOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Temporary order not found or expired'
      });
    }

    const tempOrder = tempOrders[0];

    // Initiate STK push
    const stkResult = await mpesaService.initiateSTKPush({
      tempOrderRef,
      phoneNumber,
      amount,
      accountReference: accountReference || tempOrderRef,
      transactionDesc: transactionDesc || `E-Bikes Payment - ${tempOrderRef}`
    });

    if (stkResult.success) {
      // Update temp order with payment reference
      await db.query(
        'UPDATE temp_orders SET checkout_request_id = ?, status = "payment_initiated" WHERE temp_ref = ?',
        [stkResult.data.checkoutRequestId, tempOrderRef]
      );

      res.json({
        success: true,
        checkoutRequestId: stkResult.data.checkoutRequestId,
        merchantRequestId: stkResult.data.merchantRequestId,
        customerMessage: stkResult.data.customerMessage,
        message: 'STK push sent successfully'
      });
    } else {
      res.status(400).json(stkResult);
    }

  } catch (error) {
    console.error('❌ M-Pesa payment initiation failed:', error);
    res.status(500).json({
      success: false,
      message: 'M-Pesa payment initiation failed',
      error: error.message
    });
  }
};

// ================================
// BANK TRANSFER INITIATION
// ================================

export const initiateBankTransfer = async (req, res) => {
  try {
    console.log('🏦 Initiating bank transfer...');
    const { tempOrderRef, amount, customerName, customerEmail, customerPhone } = req.body;

    // Validate input
    if (!tempOrderRef || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tempOrderRef, amount'
      });
    }

    // Get temp order data
    const [tempOrders] = await db.query(
      'SELECT * FROM temp_orders WHERE temp_ref = ? AND status = "pending_payment" AND expires_at > NOW()',
      [tempOrderRef]
    );

    if (tempOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Temporary order not found or expired'
      });
    }

    // Generate bank transfer reference
    const transferRef = `BT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Bank details (configure these in your environment)
    const bankDetails = {
      bankName: process.env.BANK_NAME || 'Equity Bank Kenya',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0123456789',
      accountName: process.env.BANK_ACCOUNT_NAME || 'Your Business Name',
      branchCode: process.env.BANK_BRANCH_CODE || '068',
      reference: transferRef,
      swiftCode: process.env.BANK_SWIFT_CODE || 'EQBLKENA'
    };

    // Store bank transfer record
    const transferData = {
      temp_order_ref: tempOrderRef,
      reference_number: transferRef,
      amount: amount,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      bank_details: JSON.stringify(bankDetails),
      status: 'pending_transfer',
      created_at: new Date()
    };

    await db.query(
      'INSERT INTO bank_transfers SET ?',
      [transferData]
    );

    // Update temp order status
    await db.query(
      'UPDATE temp_orders SET bank_transfer_ref = ?, status = "awaiting_bank_transfer" WHERE temp_ref = ?',
      [transferRef, tempOrderRef]
    );

    res.json({
      success: true,
      bankDetails,
      transferReference: transferRef,
      message: 'Bank transfer details generated successfully'
    });

  } catch (error) {
    console.error('❌ Bank transfer initiation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Bank transfer initiation failed',
      error: error.message
    });
  }
};

// ================================
// PAYMENT STATUS CHECKING
// ================================

export const checkPaymentStatus = async (req, res) => {
  try {
    const { tempOrderRef } = req.params;

    console.log('🔍 Checking payment status for:', tempOrderRef);

    // Get temp order
    const [tempOrders] = await db.query(
      'SELECT * FROM temp_orders WHERE temp_ref = ?',
      [tempOrderRef]
    );

    if (tempOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order reference not found'
      });
    }

    const tempOrder = tempOrders[0];

    // Check if order was already created
    if (tempOrder.final_order_id) {
      return res.json({
        status: 'completed',
        orderId: tempOrder.final_order_id,
        message: 'Payment completed and order created'
      });
    }

    // Check M-Pesa transaction if exists
    if (tempOrder.checkout_request_id) {
      const [mpesaTransactions] = await db.query(
        'SELECT * FROM mpesa_transactions WHERE checkout_request_id = ?',
        [tempOrder.checkout_request_id]
      );

      if (mpesaTransactions.length > 0) {
        const transaction = mpesaTransactions[0];
        
        if (transaction.status === 'success') {
          // Create final order if payment successful
          if (!tempOrder.final_order_id) {
            const orderId = await createFinalOrder(tempOrder, transaction);
            
            await db.query(
              'UPDATE temp_orders SET final_order_id = ?, status = "completed" WHERE temp_ref = ?',
              [orderId, tempOrderRef]
            );

            return res.json({
              status: 'completed',
              orderId: orderId,
              transactionId: transaction.mpesa_receipt_number,
              message: 'Payment successful'
            });
          }
        } else if (transaction.status === 'failed') {
          return res.json({
            status: 'failed',
            message: transaction.result_desc || 'Payment failed'
          });
        } else {
          // Still pending - query M-Pesa for updates
          await mpesaService.querySTKPushStatus(tempOrder.checkout_request_id);
          
          return res.json({
            status: 'pending',
            message: 'Payment is being processed'
          });
        }
      }
    }

    // Check bank transfer if exists
    if (tempOrder.bank_transfer_ref) {
      const [bankTransfers] = await db.query(
        'SELECT * FROM bank_transfers WHERE reference_number = ?',
        [tempOrder.bank_transfer_ref]
      );

      if (bankTransfers.length > 0) {
        const transfer = bankTransfers[0];
        
        if (transfer.status === 'verified') {
          // Create final order if bank transfer verified
          if (!tempOrder.final_order_id) {
            const orderId = await createFinalOrder(tempOrder, transfer);
            
            await db.query(
              'UPDATE temp_orders SET final_order_id = ?, status = "completed" WHERE temp_ref = ?',
              [orderId, tempOrderRef]
            );

            return res.json({
              status: 'completed',
              orderId: orderId,
              message: 'Bank transfer verified and order created'
            });
          }
        } else if (transfer.status === 'rejected') {
          return res.json({
            status: 'failed',
            message: 'Bank transfer was rejected'
          });
        } else {
          return res.json({
            status: 'pending_verification',
            message: 'Bank transfer is being verified'
          });
        }
      }
    }

    // Default response for pending payments
    res.json({
      status: 'pending',
      message: 'Payment is being processed'
    });

  } catch (error) {
    console.error('❌ Payment status check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
};

// ================================
// M-PESA CALLBACK HANDLER
// ================================

export const mpesaCallback = async (req, res) => {
  try {
    console.log('📞 M-Pesa callback received');
    
    const result = await mpesaService.processCallback(req.body);
    
    if (result.success && result.data.status === 'success') {
      // Get the transaction to find temp order
      const checkoutRequestId = req.body.Body.stkCallback.CheckoutRequestID;
      
      const [tempOrders] = await db.query(
        'SELECT * FROM temp_orders WHERE checkout_request_id = ?',
        [checkoutRequestId]
      );

      if (tempOrders.length > 0) {
        const tempOrder = tempOrders[0];
        
        // Create final order
        const [mpesaTransactions] = await db.query(
          'SELECT * FROM mpesa_transactions WHERE checkout_request_id = ?',
          [checkoutRequestId]
        );

        if (mpesaTransactions.length > 0) {
          const transaction = mpesaTransactions[0];
          const orderId = await createFinalOrder(tempOrder, transaction);
          
          await db.query(
            'UPDATE temp_orders SET final_order_id = ?, status = "completed" WHERE temp_ref = ?',
            [orderId, tempOrder.temp_ref]
          );
        }
      }
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });

  } catch (error) {
    console.error('❌ M-Pesa callback error:', error);
    res.json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
};

// ================================
// HELPER FUNCTIONS
// ================================

const createFinalOrder = async (tempOrder, paymentData) => {
  try {
    console.log('📝 Creating final order from temp order:', tempOrder.temp_ref);

    const customerData = JSON.parse(tempOrder.customer_data);
    const deliveryData = JSON.parse(tempOrder.delivery_data);
    const paymentDataParsed = JSON.parse(tempOrder.payment_data);
    const itemsData = JSON.parse(tempOrder.items_data);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Create order record
    const orderData = {
      order_number: orderNumber,
      temp_order_ref: tempOrder.temp_ref,
      customer_name: customerData.name,
      customer_phone: customerData.phone,
      customer_email: customerData.email,
      delivery_method: deliveryData.method,
      delivery_address: deliveryData.address,
      delivery_location: JSON.stringify(deliveryData.location),
      delivery_cost: deliveryData.cost || 0,
      payment_method: paymentData.payment_method || 'mpesa',
      payment_status: 'paid',
      order_status: 'confirmed',
      subtotal: tempOrder.calculated_total - (deliveryData.cost || 0),
      total_amount: tempOrder.calculated_total,
      deposit_paid: tempOrder.payment_required,
      balance_due: tempOrder.calculated_total - tempOrder.payment_required,
      notes: tempOrder.notes,
      created_at: new Date()
    };

    const [orderResult] = await db.query(
      'INSERT INTO orders SET ?',
      [orderData]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of itemsData) {
      const itemData = {
        order_id: orderId,
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        discount: item.discount || 0,
        discount_amount: item.discount_amount || 0,
        total_price: (item.discount ? (item.price - item.discount_amount) : item.price) * item.quantity
      };

      await db.query(
        'INSERT INTO order_items SET ?',
        [itemData]
      );
    }

    console.log('✅ Final order created:', orderNumber);
    return orderId;

  } catch (error) {
    console.error('❌ Failed to create final order:', error);
    throw error;
  }
};

// ================================
// PROOF OF PAYMENT UPLOAD
// ================================

export const submitProofOfPayment = async (req, res) => {
  try {
    console.log('📄 Processing proof of payment upload...');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No proof file uploaded'
      });
    }

    const { tempOrderRef, reference, amount } = req.body;

    if (!tempOrderRef || !reference) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tempOrderRef, reference'
      });
    }

    // Update bank transfer with proof
    const [result] = await db.query(
      `UPDATE bank_transfers SET 
       proof_file_path = ?, 
       proof_uploaded_at = NOW(), 
       status = 'pending_verification' 
       WHERE reference_number = ?`,
      [req.file.path, reference]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bank transfer reference not found'
      });
    }

    res.json({
      success: true,
      message: 'Proof of payment uploaded successfully. Your payment is being verified.',
      filename: req.file.filename
    });

  } catch (error) {
    console.error('❌ Proof upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload proof of payment',
      error: error.message
    });
  }
};

// ================================
// ADDITIONAL UTILITY FUNCTIONS
// ================================

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const [orders] = await db.query(
      `SELECT o.*, 
       GROUP_CONCAT(
         JSON_OBJECT(
           'name', oi.item_name,
           'quantity', oi.quantity,
           'price', oi.unit_price,
           'total', oi.total_price
         )
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = ? OR o.order_number = ?
       GROUP BY o.id`,
      [orderId, orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: orders[0]
    });

  } catch (error) {
    console.error('❌ Get order details failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order details',
      error: error.message
    });
  }
};

export const getPaymentReceipts = async (req, res) => {
  try {
    const { orderId } = req.params;

    const [receipts] = await db.query(
      'SELECT * FROM payment_receipts WHERE order_id = ?',
      [orderId]
    );

    res.json({
      success: true,
      receipts
    });

  } catch (error) {
    console.error('❌ Get receipts failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment receipts',
      error: error.message
    });
  }
};

export const checkBankTransferStatus = async (req, res) => {
  try {
    const { referenceNumber } = req.params;

    const [transfers] = await db.query(
      'SELECT * FROM bank_transfers WHERE reference_number = ?',
      [referenceNumber]
    );

    if (transfers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bank transfer not found'
      });
    }

    res.json({
      success: true,
      transfer: transfers[0]
    });

  } catch (error) {
    console.error('❌ Check bank transfer status failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check bank transfer status',
      error: error.message
    });
  }
};

export const getPendingBankTransfers = async (req, res) => {
  try {
    const [transfers] = await db.query(
      `SELECT bt.*, to.customer_data, to.calculated_total
       FROM bank_transfers bt
       JOIN temp_orders to ON bt.temp_order_ref = to.temp_ref
       WHERE bt.status IN ('pending_verification', 'pending_transfer')
       ORDER BY bt.created_at DESC`
    );

    res.json({
      success: true,
      transfers
    });

  } catch (error) {
    console.error('❌ Get pending transfers failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending bank transfers',
      error: error.message
    });
  }
};

export const verifyBankTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { status, notes } = req.body; // 'verified' or 'rejected'

    const [result] = await db.query(
      `UPDATE bank_transfers SET 
       status = ?, 
       admin_notes = ?, 
       verified_at = NOW(), 
       verified_by = ?
       WHERE id = ?`,
      [status, notes, req.user.id, transferId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bank transfer not found'
      });
    }

    res.json({
      success: true,
      message: `Bank transfer ${status} successfully`
    });

  } catch (error) {
    console.error('❌ Verify bank transfer failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify bank transfer',
      error: error.message
    });
  }
};