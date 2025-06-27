// src/routes/auth.js
import express from 'express';
import { 
  checkUser, 
  registerGoogle, 
  loginGoogle, 
  testAuth,
  setPassword,
  login,
  requestPasswordSetup,
  debugAuth
} from '../controllers/auth.js';

const router = express.Router();

// Check if user exists
router.post('/check-user', checkUser);

// Register with Google
router.post('/register-google', registerGoogle);

// Login with Google
router.post('/login-google', loginGoogle);

// Password setup endpoint
router.post('/set-password', setPassword);

// Regular email/password login
router.post('/login', login);

// Request password setup email (for existing users)
router.post('/request-password-setup', requestPasswordSetup);

// Test auth system
router.get('/test', testAuth);

// Debug endpoint to check database state
router.get('/debug', debugAuth);

export default router;