// src/services/mpesaService.js
import crypto from 'crypto';
import axios from 'axios';
import { db } from '../config/db.js';

class MPesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE || '174379';
    this.passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    this.callbackUrl = process.env.MPESA_CALLBACK_URL || `${process.env.BASE_URL}/api/payments/mpesa/callback`;
    this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
    
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    
    this.accessTokenUrl = `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
    this.stkPushUrl = `${this.baseUrl}/mpesa/stkpush/v1/processrequest`;
    this.queryUrl = `${this.baseUrl}/mpesa/stkpushquery/v1/query`;
    
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async generateAccessToken() {
    try {
      console.log('🔑 Generating M-Pesa access token...');
      
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(this.accessTokenUrl, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        this.tokenExpiry = Date.now() + (parseInt(response.data.expires_in) - 60) * 1000;
        
        console.log('✅ M-Pesa access token generated successfully');
        return this.accessToken;
      } else {
        throw new Error('Failed to get access token from M-Pesa API');
      }
    } catch (error) {
      console.error('❌ M-Pesa access token generation failed:', error.response?.data || error.message);
      throw new Error(`M-Pesa authentication failed: ${error.response?.data?.errorMessage || error.message}`);
    }
  }

  async getAccessToken() {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.generateAccessToken();
    }
    return this.accessToken;
  }

  generatePassword() {
    const timestamp = this.generateTimestamp();
    const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
    return { password, timestamp };
  }

  generateTimestamp() {
    const now = new Date();
    return now.getFullYear() +
           String(now.getMonth() + 1).padStart(2, '0') +
           String(now.getDate()).padStart(2, '0') +
           String(now.getHours()).padStart(2, '0') +
           String(now.getMinutes()).padStart(2, '0') +
           String(now.getSeconds()).padStart(2, '0');
  }

  formatPhoneNumber(phone) {
    phone = phone.replace(/\D/g, '');
    
    if (phone.startsWith('254')) {
      return phone;
    } else if (phone.startsWith('0')) {
      return '254' + phone.substring(1);
    } else if (phone.startsWith('7') || phone.startsWith('1')) {
      return '254' + phone;
    }
    
    throw new Error('Invalid phone number format. Please use format: 254XXXXXXXXX or 07XXXXXXXX');
  }

  async initiateSTKPush(orderData) {
    try {
      console.log('📱 Initiating M-Pesa STK push...');
      
      const { tempOrderRef, phoneNumber, amount, accountReference, transactionDesc } = orderData;
      
      if (!tempOrderRef || !phoneNumber || !amount) {
        throw new Error('Missing required fields: tempOrderRef, phoneNumber, amount');
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const stkPushData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(parseFloat(amount)),
        PartyA: formattedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference || tempOrderRef,
        TransactionDesc: transactionDesc || `E-Bikes Payment - ${tempOrderRef}`
      };

      console.log('📤 Sending STK push request:', {
        ...stkPushData,
        Password: '[HIDDEN]'
      });

      const response = await axios.post(this.stkPushUrl, stkPushData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 STK push response:', response.data);

      // ✅ FIXED: Store transaction record
      const transactionData = {
        temp_order_ref: tempOrderRef,
        merchant_request_id: response.data.MerchantRequestID,
        checkout_request_id: response.data.CheckoutRequestID,
        response_code: response.data.ResponseCode,
        response_description: response.data.ResponseDescription,
        customer_message: response.data.CustomerMessage,
        phone_number: formattedPhone,
        amount: amount,
        stk_push_sent: true,
        stk_push_response: JSON.stringify(response.data),
        status: response.data.ResponseCode === '0' ? 'pending' : 'failed',
        account_reference: accountReference,
        transaction_desc: transactionDesc
      };

      const [result] = await db.query(
        `INSERT INTO mpesa_transactions SET ?`,
        [transactionData]
      );

      if (response.data.ResponseCode === '0') {
        console.log('✅ STK push sent successfully');
        return {
          success: true,
          message: 'STK push sent successfully. Please check your phone.',
          data: {
            transactionId: result.insertId,
            checkoutRequestId: response.data.CheckoutRequestID,
            merchantRequestId: response.data.MerchantRequestID,
            customerMessage: response.data.CustomerMessage
          }
        };
      } else {
        console.log('❌ STK push failed:', response.data.ResponseDescription);
        return {
          success: false,
          message: response.data.ResponseDescription || 'STK push failed',
          errorCode: response.data.ResponseCode,
          data: response.data
        };
      }

    } catch (error) {
      console.error('💥 STK push error:', error.response?.data || error.message);
      
      // ✅ ENHANCED: Better error handling with specific messages
      let errorMessage = 'STK push failed';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errorMessage) {
          errorMessage = errorData.errorMessage;
        } else if (errorData.ResponseDescription) {
          errorMessage = errorData.ResponseDescription;
        }
      } else if (error.message.includes('phone')) {
        errorMessage = 'Invalid phone number format';
      } else if (error.message.includes('network') || error.code === 'ECONNREFUSED') {
        errorMessage = 'Network error. Please check your connection and try again';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.message
      };
    }
  }

  async querySTKPushStatus(checkoutRequestId) {
    try {
      console.log('🔍 Querying M-Pesa STK push status for:', checkoutRequestId);
      
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const queryData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      console.log('📤 Sending STK query request:', queryData);

      const response = await axios.post(this.queryUrl, queryData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 STK query response:', response.data);

      // ✅ HANDLE INITIATOR ERROR: Code 2001 means query not available
      if (response.data.ResultCode === '2001') {
        console.log('⚠️ M-Pesa query not available (initiator credentials needed)');
        
        // Don't update status, just return that query is not available
        return {
          success: false,
          status: 'query_not_available',
          message: 'M-Pesa status query not available in sandbox mode',
          data: response.data
        };
      }

      // Process other response codes as before
      let status = 'pending';
      let resultDesc = response.data.ResultDesc || 'Query completed';
      
      if (response.data.ResultCode === '0') {
        status = 'success';
        
        await db.query(
          `UPDATE mpesa_transactions 
          SET status = 'success', 
              result_code = ?, 
              result_desc = ?, 
              callback_received = true,
              updated_at = NOW() 
          WHERE checkout_request_id = ?`,
          [response.data.ResultCode, resultDesc, checkoutRequestId]
        );
        
      } else if (response.data.ResultCode === '1032') {
        status = 'cancelled';
        resultDesc = 'Payment cancelled by user';
        
        await db.query(
          `UPDATE mpesa_transactions 
          SET status = 'cancelled', 
              result_code = ?, 
              result_desc = ?, 
              updated_at = NOW() 
          WHERE checkout_request_id = ?`,
          [response.data.ResultCode, resultDesc, checkoutRequestId]
        );
        
      } else if (['1', '1001', '1019'].includes(response.data.ResultCode)) {
        status = 'failed';
        
        await db.query(
          `UPDATE mpesa_transactions 
          SET status = 'failed', 
              result_code = ?, 
              result_desc = ?, 
              updated_at = NOW() 
          WHERE checkout_request_id = ?`,
          [response.data.ResultCode, resultDesc, checkoutRequestId]
        );
      }

      return {
        success: true,
        status: status,
        data: response.data
      };

    } catch (error) {
      console.error('💥 STK query error:', error.response?.data || error.message);
      
      return {
        success: false,
        status: 'error',
        message: error.response?.data?.errorMessage || error.message
      };
    }
  }

  async processCallback(callbackData) {
    try {
      console.log('📞 Processing M-Pesa callback...');
      console.log('📥 Callback data:', JSON.stringify(callbackData, null, 2));

      const { Body } = callbackData;
      const { stkCallback } = Body;
      
      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const merchantRequestId = stkCallback.MerchantRequestID;
      const resultCode = stkCallback.ResultCode;
      const resultDesc = stkCallback.ResultDesc;

      const [transactions] = await db.query(
        'SELECT * FROM mpesa_transactions WHERE checkout_request_id = ?',
        [checkoutRequestId]
      );

      if (transactions.length === 0) {
        console.log('❌ Transaction not found for checkout request ID:', checkoutRequestId);
        return { success: false, message: 'Transaction not found' };
      }

      const transaction = transactions[0];
      let updateData = {
        callback_received: true,
        callback_data: JSON.stringify(callbackData),
        result_code: resultCode,
        result_desc: resultDesc,
        updated_at: new Date()
      };

      if (resultCode === 0) {
        const callbackMetadata = stkCallback.CallbackMetadata;
        if (callbackMetadata && callbackMetadata.Item) {
          const metadata = {};
          callbackMetadata.Item.forEach(item => {
            metadata[item.Name] = item.Value;
          });

          updateData = {
            ...updateData,
            status: 'success',
            mpesa_receipt_number: metadata.MpesaReceiptNumber,
            transaction_date: new Date(metadata.TransactionDate * 1000),
            amount: metadata.Amount
          };

          console.log('✅ Payment successful:', metadata);

          await db.query(
            'UPDATE orders SET payment_status = ? WHERE id = ?',
            ['paid', transaction.order_id]
          );

          await this.generateReceipt(transaction.order_id, {
            mpesa_receipt_number: metadata.MpesaReceiptNumber,
            transaction_date: new Date(metadata.TransactionDate * 1000),
            amount: metadata.Amount,
            phone_number: metadata.PhoneNumber
          });
        }
      } else {
        updateData.status = 'failed';
        console.log('❌ Payment failed:', resultDesc);
      }

      await db.query(
        `UPDATE mpesa_transactions SET ? WHERE checkout_request_id = ?`,
        [updateData, checkoutRequestId]
      );

      return {
        success: true,
        message: resultCode === 0 ? 'Payment processed successfully' : 'Payment failed',
        data: updateData
      };

    } catch (error) {
      console.error('💥 Callback processing error:', error);
      return { success: false, message: 'Callback processing failed', error: error.message };
    }
  }

  async generateReceipt(orderId, paymentData) {
    try {
      console.log('🧾 Generating payment receipt...');

      const receiptNumber = `RCP-${Date.now()}-${orderId}`;

      const [orders] = await db.query(
        `SELECT o.*, u.email as user_email 
         FROM orders o 
         LEFT JOIN users u ON o.user_id = u.id 
         WHERE o.id = ?`,
        [orderId]
      );

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
        payment_type: 'mpesa',
        amount: paymentData.amount,
        payment_date: paymentData.transaction_date,
        receipt_data: JSON.stringify({
          order: order,
          items: orderItems,
          payment: paymentData
        })
      };

      const [result] = await db.query(
        'INSERT INTO payment_receipts SET ?',
        [receiptData]
      );

      const emailSent = await this.sendReceiptEmail(order, orderItems, paymentData, receiptNumber);

      if (emailSent) {
        await db.query(
          'UPDATE payment_receipts SET email_sent = TRUE, email_sent_at = NOW() WHERE id = ?',
          [result.insertId]
        );
      }

      console.log('✅ Receipt generated and email sent');
      return { receiptNumber, emailSent };

    } catch (error) {
      console.error('💥 Receipt generation failed:', error);
      throw error;
    }
  }

  async sendReceiptEmail(order, orderItems, paymentData, receiptNumber) {
    try {
      const { sendPaymentReceiptEmail } = await import('./emailService.js');
      
      const receiptDetails = {
        receiptNumber: receiptNumber,
        orderId: order.order_number,
        customerName: order.customer_name,
        paymentMethod: 'M-Pesa',
        mpesaCode: paymentData.mpesa_receipt_number,
        amount: paymentData.amount,
        paymentDate: paymentData.transaction_date,
        items: orderItems.map(item => ({
          name: item.item_name,
          quantity: item.quantity,
          price: item.total_price
        })),
        order: order
      };

      const emailAddress = order.user_email || order.customer_email;
      if (!emailAddress) {
        console.log('⚠️ No email address found for receipt');
        return false;
      }

      await sendPaymentReceiptEmail(emailAddress, receiptDetails);
      return true;

    } catch (error) {
      console.error('📧 Receipt email failed:', error);
      return false;
    }
  }

  async getTransactionStatus(orderId) {
    try {
      const [transactions] = await db.query(
        'SELECT * FROM mpesa_transactions WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
        [orderId]
      );

      if (transactions.length === 0) {
        return { success: false, message: 'No M-Pesa transaction found for this order' };
      }

      const transaction = transactions[0];
      
      if (transaction.status === 'pending' && 
          (Date.now() - new Date(transaction.created_at).getTime()) > 5 * 60 * 1000) {
        
        await this.querySTKPushStatus(transaction.checkout_request_id);
        
        const [updatedTransactions] = await db.query(
          'SELECT * FROM mpesa_transactions WHERE checkout_request_id = ?',
          [transaction.checkout_request_id]
        );
        
        return {
          success: true,
          transaction: updatedTransactions[0]
        };
      }

      return {
        success: true,
        transaction: transaction
      };

    } catch (error) {
      console.error('💥 Get transaction status failed:', error);
      return { success: false, message: 'Failed to get transaction status' };
    }
  }
}

export default new MPesaService();