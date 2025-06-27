// src/controllers/auth.js
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../config/db.js';
import User from '../models/User.js';
import { 
  sendPasswordSetupEmail, 
  sendWelcomeEmail, 
  testEmailConfiguration 
} from '../services/emailService.js';

// Set the database connection for static methods
User.setDbConnection(db);

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate secure password reset token
const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Verify Google token
const verifyGoogleToken = async (token) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    throw new Error('Invalid Google token');
  }
};

// Check if user exists
export const checkUser = async (req, res) => {
  console.log('🔍 Check user endpoint called');
  
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const userModel = new User(db);
    const user = await userModel.findByEmail(email);
    
    console.log(`👤 User check for ${email}:`, user ? 'Found' : 'Not found');

    res.json({ 
      exists: !!user,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        can_login_with_password: user.can_login_with_password
      } : null
    });

  } catch (error) {
    console.error('💥 Check user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Test auth system
export const testAuth = async (req, res) => {
  console.log('🧪 Running auth system test...');
  
  try {
    // Test database connection
    await db.query('SELECT 1');
    console.log('✅ Database connection test passed');
    
    // Count users in database
    const userModel = new User(db);
    const userCount = await userModel.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    // Test email configuration
    const emailConfigValid = await testEmailConfiguration();
    console.log(`📧 Email configuration: ${emailConfigValid ? 'Valid' : 'Invalid'}`);
    
    // Check Google OAuth configuration
    const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    console.log(`🔐 Google OAuth configured: ${googleConfigured}`);
    
    // Check JWT configuration
    const jwtConfigured = !!process.env.JWT_SECRET;
    console.log(`🔑 JWT configured: ${jwtConfigured}`);

    res.json({
      success: true,
      message: 'Auth system is working perfectly',
      database_connected: true,
      user_table_accessible: true,
      user_count: userCount,
      user_model_available: true,
      google_client_configured: googleConfigured,
      google_client_secret_configured: !!process.env.GOOGLE_CLIENT_SECRET,
      jwt_secret_configured: jwtConfigured,
      email_configured: emailConfigValid,
      environment: process.env.NODE_ENV || 'development',
      features: {
        google_oauth: googleConfigured,
        email_registration: emailConfigValid,
        email_notifications: emailConfigValid,
        jwt_authentication: jwtConfigured
      }
    });
    
  } catch (error) {
    console.error('💥 Auth system test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Auth system test failed',
      error: error.message,
      stack: error.stack
    });
  }
};

// Enhanced Google registration with password setup email
export const registerGoogle = async (req, res) => {
  console.log('🔍 Google registration attempt started');
  console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { googleToken, userData } = req.body;
    
    console.log('🎫 Google Token received:', googleToken ? 'Yes' : 'No');
    console.log('👤 User data received:', userData);
    
    if (!googleToken) {
      console.log('❌ No Google token provided');
      return res.status(400).json({ 
        success: false, 
        message: 'Google token is required' 
      });
    }

    // Verify the Google token
    let googleUser;
    try {
      googleUser = await verifyGoogleToken(googleToken);
      console.log('✅ Google token verified successfully:', googleUser.email);
    } catch (tokenError) {
      console.log('❌ Google token verification failed:', tokenError.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Google token' 
      });
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists:', userData.email);
    const userModel = new User(db);
    const existingUser = await userModel.findByEmail(userData.email);
    
    if (existingUser) {
      console.log('⚠️ User already exists with email:', userData.email);
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Generate password setup token
    const passwordSetupToken = generatePasswordResetToken();
    const passwordSetupExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Prepare user data for insertion
    const newUserData = {
      name: userData.name,
      email: userData.email,
      google_id: userData.google_id,
      picture: userData.picture,
      given_name: userData.given_name,
      family_name: userData.family_name,
      email_verified: true,
      provider: 'google',
      password: null,
      password_setup_token: passwordSetupToken,
      password_setup_expires: passwordSetupExpires,
      can_login_with_password: false,
      status: 'active'
    };

    console.log('💾 Attempting to create user with data:', {
      ...newUserData,
      password_setup_token: '[HIDDEN]'
    });

    // Create the user
    const userId = await userModel.create(newUserData);
    console.log('✅ User created successfully with ID:', userId);
    
    // Get the created user
    const newUser = await userModel.findById(userId);
    if (!newUser) {
      console.log('❌ User creation verification failed');
      return res.status(500).json({
        success: false,
        message: 'User creation failed - verification error'
      });
    }

    console.log('✅ User verified in database:', newUser.email);

    // Count total users after insertion
    const userCount = await userModel.count();
    console.log('📊 Total users in database after insertion:', userCount);

    // Send password setup email
    let emailSent = false;
    try {
      emailSent = await sendPasswordSetupEmail(newUser, passwordSetupToken);
      console.log('📧 Password setup email sent:', emailSent ? 'Success' : 'Failed');
    } catch (emailError) {
      console.error('📧 Email sending failed:', emailError.message);
      // Don't fail the registration if email fails
    }

    res.json({ 
      success: true, 
      message: 'User registered successfully. Password setup email sent.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        provider: 'google',
        can_login_with_password: false,
        email_verified: true
      },
      password_setup_email_sent: emailSent
    });

  } catch (error) {
    console.error('💥 Google registration error:', error);
    console.error('📚 Error stack:', error.stack);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

// Enhanced Google login endpoint
export const loginGoogle = async (req, res) => {
  console.log('🔍 Google login attempt started');
  
  try {
    const { googleToken, userData } = req.body;
    
    // Verify Google token
    if (!googleToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google token is required' 
      });
    }

    let googleUser;
    try {
      googleUser = await verifyGoogleToken(googleToken);
      console.log('✅ Google token verified for login:', googleUser.email);
    } catch (tokenError) {
      console.log('❌ Google token verification failed:', tokenError.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Google token' 
      });
    }

    // Find existing user
    const userModel = new User(db);
    const user = await userModel.findByEmail(userData.email);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please register first.' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login and Google info if needed
    await userModel.update(user.id, {
      last_login: new Date(),
      picture: userData.picture || user.picture
    });

    console.log('✅ Google user logged in successfully:', user.email);

    res.json({ 
      success: true, 
      message: 'Google login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        picture: user.picture,
        can_login_with_password: user.can_login_with_password
      }
    });

  } catch (error) {
    console.error('💥 Google login error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Google login failed', 
      error: error.message 
    });
  }
};

// Password setup endpoint
export const setPassword = async (req, res) => {
  console.log('🔍 Password setup attempt started');
  
  try {
    const { token, email, password, confirmPassword } = req.body;
    
    if (!token || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Find user with valid token
    const userModel = new User(db);
    const user = await userModel.findByPasswordSetupToken(token);

    if (!user || user.email !== email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired password setup link' 
      });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user with password and clear setup token
    await userModel.update(user.id, {
      password: hashedPassword,
      can_login_with_password: true,
      password_setup_token: null,
      password_setup_expires: null
    });

    console.log('✅ Password set successfully for user:', user.email);

    res.json({ 
      success: true, 
      message: 'Password set successfully! You can now sign in with your email and password.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        can_login_with_password: true
      }
    });

  } catch (error) {
    console.error('💥 Password setup error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Password setup failed', 
      error: error.message 
    });
  }
};

// Regular email/password login
export const login = async (req, res) => {
  console.log('🔍 Login attempt started');
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const userModel = new User(db);
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    if (!user.can_login_with_password || !user.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Password login not set up for this account. Please use Google Sign-In or set up your password.' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await userModel.updateLastLogin(user.id);

    console.log('✅ User logged in successfully:', user.email);

    res.json({ 
      success: true, 
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        picture: user.picture,
        can_login_with_password: user.can_login_with_password
      }
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Login failed', 
      error: error.message 
    });
  }
};

// Request password setup email
export const requestPasswordSetup = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const userModel = new User(db);
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.json({ 
        success: true, 
        message: 'If an account with this email exists, a password setup email has been sent.' 
      });
    }

    const passwordSetupToken = generatePasswordResetToken();
    const passwordSetupExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await userModel.update(user.id, {
      password_setup_token: passwordSetupToken,
      password_setup_expires: passwordSetupExpires
    });

    let emailSent = false;
    try {
      emailSent = await sendPasswordSetupEmail(user, passwordSetupToken);
    } catch (emailError) {
      console.error('📧 Email sending failed:', emailError.message);
    }

    res.json({ 
      success: true, 
      message: 'If an account with this email exists, a password setup email has been sent.',
      email_sent: emailSent
    });

  } catch (error) {
    console.error('💥 Password setup request error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Request failed', 
      error: error.message 
    });
  }
};

// Debug endpoint
export const debugAuth = async (req, res) => {
  try {
    console.log('🔍 Debug endpoint called');
    
    const userModel = new User(db);
    const userCount = await userModel.count();
    console.log('📊 Total users in database:', userCount);
    
    const recentUsers = await userModel.getAllUsers();
    console.log('👥 Recent users:', recentUsers.slice(0, 5)); // Log first 5 users
    
    await db.query('SELECT 1');
    console.log('✅ Database connection is working');
    
    res.json({
      success: true,
      database_connected: true,
      user_count: userCount,
      recent_users: recentUsers.slice(0, 10), // Return first 10 users
      table_exists: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};