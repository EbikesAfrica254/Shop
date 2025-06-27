// src/routes/payments.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.js';
import {
  validateOrder,
  initiateMpesaPayment,
  mpesaCallback,
  initiateBankTransfer,
  checkPaymentStatus,
  getOrderDetails,
  submitProofOfPayment,
  getPaymentReceipts,
  checkBankTransferStatus,
  getPendingBankTransfers,
  verifyBankTransfer
} from '../controllers/paymentController.js';

const router = express.Router();

// Configure multer for file uploads
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

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// ================================
// NEW PAYMENT FLOW ROUTES
// ================================

// Step 1: Validate order (calculate totals, don't create order yet)
router.post('/validate-order', validateOrder);

// Step 2: Initiate payment
router.post('/mpesa/initiate', initiateMpesaPayment);
router.post('/bank-transfer/initiate', initiateBankTransfer);

// Step 3: Payment callbacks (M-Pesa creates order after successful payment)
router.post('/mpesa/callback', mpesaCallback);

// Step 4: Check payment status
router.get('/status/:tempOrderRef', checkPaymentStatus);

// ================================
// ORDER MANAGEMENT (AFTER PAYMENT)
// ================================

router.get('/orders/:orderId', getOrderDetails);
router.get('/orders/:orderId/receipts', getPaymentReceipts);

// ================================
// BANK TRANSFER ADDITIONAL ROUTES
// ================================

router.post('/upload-proof', upload.single('proof'), submitProofOfPayment);
router.get('/bank-transfer/:referenceNumber', checkBankTransferStatus);

// ================================
// ADMIN ROUTES
// ================================

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

router.get('/admin/bank-transfers/pending', authenticate, requireAdmin, getPendingBankTransfers);
router.put('/admin/bank-transfers/:transferId/verify', authenticate, requireAdmin, verifyBankTransfer);

// ================================
// UTILITY ROUTES
// ================================

router.get('/test', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Payment system test completed',
      flow: 'validate → pay → create-order → receipt → email',
      endpoints: {
        validate_order: '/api/payments/validate-order',
        initiate_mpesa: '/api/payments/mpesa/initiate',
        initiate_bank: '/api/payments/bank-transfer/initiate',
        check_status: '/api/payments/status/{tempOrderRef}',
        mpesa_callback: '/api/payments/mpesa/callback'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment system test failed',
      error: error.message
    });
  }
});

export default router;