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
  limits: { fileSize: 5 * 1024 * 1024 },
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
// PAYMENT FLOW ROUTES (FIXED ENDPOINTS)
// ================================

// Step 1: Validate order
router.post('/validate-order', validateOrder);

// Step 2: Initiate payments (FIXED - match frontend expectations)
router.post('/mpesa/stk-push', initiateMpesaPayment);           // ✅ FIXED: was /mpesa/initiate
router.post('/mpesa/initiate', initiateMpesaPayment);           // Keep both for compatibility
router.post('/bank-transfer', initiateBankTransfer);            // ✅ FIXED: simplified path
router.post('/bank-transfer/initiate', initiateBankTransfer);   // Keep both for compatibility

// Step 3: Payment callbacks
router.post('/mpesa/callback', mpesaCallback);

// Step 4: Check payment status  
router.get('/status/:tempOrderRef', checkPaymentStatus);

// ================================
// ORDER MANAGEMENT
// ================================

router.get('/orders/:orderId', getOrderDetails);
router.get('/orders/:orderId/receipts', getPaymentReceipts);

// ================================
// FILE UPLOADS
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
// TEST ROUTE
// ================================

router.get('/test', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Payment routes active',
      endpoints: {
        validate_order: 'POST /api/payments/validate-order',
        mpesa_stk_push: 'POST /api/payments/mpesa/stk-push',
        bank_transfer: 'POST /api/payments/bank-transfer',
        check_status: 'GET /api/payments/status/{tempOrderRef}',
        mpesa_callback: 'POST /api/payments/mpesa/callback',
        upload_proof: 'POST /api/payments/upload-proof'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;