// src/services/emailService.js
import nodemailer from 'nodemailer';

// Create transporter - FIXED: createTransport (not createTransporter)
const createTransporter = () => {
  // Check for new SMTP variables first, then fall back to old EMAIL variables
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  
  if (!smtpUser || !smtpPass) {
    console.log('⚠️ Email credentials not configured - missing SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASSWORD');
    return null;
  }

  // FIXED: Use nodemailer.createTransport (not createTransporter)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass, // Use app-specific password for Gmail
    },
  });
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    console.log('🔍 Testing email configuration...');
    console.log('📧 SMTP User:', process.env.SMTP_USER || process.env.EMAIL_USER || 'Not configured');
    console.log('📧 SMTP Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
    console.log('📧 SMTP Port:', process.env.SMTP_PORT || '587');
    
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('❌ Email transporter could not be created - missing credentials');
      return false;
    }

    console.log('🔄 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.log('❌ Email configuration test failed:', error.message);
    console.log('🔍 Error details:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      hostname: error.hostname,
      port: error.port
    });
    return false;
  }
};

// Send password setup email (for Google OAuth users)
export const sendPasswordSetupEmail = async (user, setupToken) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email not configured');
    }

    // Use new SMTP_FROM variables or fall back to SMTP_USER
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'E-Bikes Platform';
    
    const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password?token=${setupToken}&email=${encodeURIComponent(user.email)}`;
    
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Set Up Your Account Password</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .button:hover { background: #45a049; }
            .info-box { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .warning-box { background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎉 Welcome to E-Bikes Platform!</h1>
            <p>Your account has been created successfully</p>
        </div>
        
        <div class="content">
            <h2>Hello ${user.name || user.given_name}! 👋</h2>
            
            <p>Great news! Your account has been created using Google Sign-In. You can now:</p>
            
            <div class="info-box">
                <strong>✅ Sign in with Google</strong> - You can continue using Google Sign-In for quick access
            </div>
            
            <p>However, if you'd like to also be able to sign in using your email and a password (without Google), please set up your account password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${setupUrl}" class="button">🔐 Set Up Account Password</a>
            </div>
            
            <div class="warning-box">
                <strong>⏰ Important:</strong> This password setup link will expire in 24 hours for security reasons.
            </div>
            
            <h3>What happens after setting your password?</h3>
            <ul>
                <li>🔑 You'll be able to sign in with your email and password</li>
                <li>🔄 You can still use Google Sign-In as before</li>
                <li>🛡️ Enhanced account security with multiple login options</li>
                <li>📱 More flexibility in how you access your account</li>
            </ul>
            
            <h3>Your Account Details:</h3>
            <ul>
                <li><strong>Name:</strong> ${user.name}</li>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Account Type:</strong> Google + Email (after password setup)</li>
                <li><strong>Status:</strong> Active ✅</li>
            </ul>
            
            <div class="info-box">
                <strong>💡 Pro Tip:</strong> Setting up a password is optional. You can always continue using Google Sign-In exclusively if you prefer!
            </div>
            
            <p>If you have any questions or need help, please don't hesitate to contact our support team.</p>
            
            <p>Welcome aboard! 🚀</p>
        </div>
        
        <div class="footer">
            <p>This email was sent because a Google account was created for ${user.email}</p>
            <p>If you didn't create this account, please contact us immediately.</p>
            <p>&copy; ${new Date().getFullYear()} E-Bikes Platform. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;

    const emailText = `
Welcome to E-Bikes Platform!

Hello ${user.name || user.given_name}!

Your account has been created successfully using Google Sign-In.

To also enable email/password login, please set up your account password:
${setupUrl}

This link will expire in 24 hours.

Your Account Details:
- Name: ${user.name}
- Email: ${user.email}
- Account Type: Google + Email (after password setup)
- Status: Active

You can continue using Google Sign-In or set up a password for additional login options.

If you have any questions, please contact our support team.

Welcome aboard!
    `;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: user.email,
      subject: '🎉 Welcome! Set Up Your Account Password - E-Bikes',
      text: emailText,
      html: emailHtml,
    };

    console.log('📧 Sending password setup email to:', user.email);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password setup email sent successfully:', result.messageId);
    
    return true;
  } catch (error) {
    console.error('💥 Error sending password setup email:', error);
    return false;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email not configured');
    }

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'E-Bikes Platform';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Welcome to E-Bikes Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to E-Bikes!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your sustainable transportation journey starts here</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for joining our E-Bikes platform. We're excited to have you on board!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Browse our collection of premium e-bikes</li>
                <li>Find the perfect bike for your needs</li>
                <li>Enjoy eco-friendly transportation</li>
                <li>Join our community of sustainable riders</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Start Exploring
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
              If you have any questions, feel free to reach out to our support team.<br>
              Happy riding! 🚴‍♂️⚡
            </p>
          </div>
        </div>
      `,
      text: `
        Welcome to E-Bikes, ${name}!
        
        Thank you for joining our platform. We're excited to have you on board!
        
        What's Next:
        - Browse our collection of premium e-bikes
        - Find the perfect bike for your needs
        - Enjoy eco-friendly transportation
        - Join our community of sustainable riders
        
        Visit our platform: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
        
        If you have any questions, feel free to reach out to our support team.
        Happy riding!
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}:`, result.messageId);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error.message);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email not configured');
    }

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'E-Bikes Platform';
    
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Reset Your E-Bikes Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f44336; padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">E-Bikes Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: #f44336; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                <strong>Security Note:</strong> This link will expire in 1 hour for your security.
                If you didn't request this password reset, please ignore this email.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <span style="word-break: break-all;">${resetLink}</span>
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset - E-Bikes Platform
        
        Hello ${name}!
        
        We received a request to reset your password. Use the link below to create a new password:
        
        ${resetLink}
        
        This link will expire in 1 hour for your security.
        If you didn't request this password reset, please ignore this email.
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}:`, result.messageId);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${email}:`, error.message);
    throw error;
  }
};

// Send verification email
export const sendVerificationEmail = async (email, verificationToken, name) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email not configured');
    }

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'E-Bikes Platform';
    
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Verify Your E-Bikes Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #4caf50; padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Verify Your Account</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">E-Bikes Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for signing up! Please verify your email address to complete your registration:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Verify Email
              </a>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                <strong>Note:</strong> This verification link will expire in 24 hours.
                If you didn't create this account, please ignore this email.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <span style="word-break: break-all;">${verificationLink}</span>
            </p>
          </div>
        </div>
      `,
      text: `
        Verify Your Account - E-Bikes Platform
        
        Hello ${name}!
        
        Thank you for signing up! Please verify your email address to complete your registration:
        
        ${verificationLink}
        
        This verification link will expire in 24 hours.
        If you didn't create this account, please ignore this email.
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}:`, result.messageId);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error.message);
    throw error;
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (email, orderDetails, customerName) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email not configured');
    }

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'E-Bikes Platform';

    const {
      orderId,
      items,
      subtotal,
      deliveryCost,
      totalAmount,
      deliveryMethod,
      deliveryAddress,
      paymentMethod,
      depositAmount
    } = orderDetails;

    const itemsList = items.map(item => 
      `<li style="margin: 5px 0;">${item.name} (x${item.quantity}) - ${item.price}</li>`
    ).join('');

    const itemsText = items.map(item => 
      `- ${item.name} (x${item.quantity}) - ${item.price}`
    ).join('\n');

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `Order Confirmation #${orderId} - E-Bikes Platform`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order #${orderId}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${customerName}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for your order! We've received your request and will process it shortly.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #333; margin-top: 0;">📦 Order Details</h3>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Items:</strong></p>
              <ul style="color: #666; margin: 10px 0; padding-left: 20px;">${itemsList}</ul>
              <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
              <p><strong>Subtotal:</strong> ${subtotal}</p>
              <p><strong>Delivery:</strong> ${deliveryCost}</p>
              <p style="font-size: 18px; color: #4caf50;"><strong>Total: ${totalAmount}</strong></p>
              ${depositAmount ? `<p style="color: #f44336;"><strong>Deposit Required:</strong> ${depositAmount}</p>` : ''}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <h3 style="color: #333; margin-top: 0;">🚚 Delivery Information</h3>
              <p><strong>Method:</strong> ${deliveryMethod}</p>
              ${deliveryAddress ? `<p><strong>Address:</strong> ${deliveryAddress}</p>` : ''}
              <p><strong>Payment:</strong> ${paymentMethod}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2e7d32; margin-top: 0;">🎯 What's Next?</h3>
              <ul style="color: #2e7d32; margin: 10px 0; padding-left: 20px;">
                <li>We'll contact you shortly to confirm payment details</li>
                <li>Your order will be prepared for ${deliveryMethod.toLowerCase()}</li>
                <li>You'll receive updates on your order status</li>
                <li>Track your order progress via WhatsApp</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                View Order Status
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
              If you have any questions about your order, please contact our support team.<br>
              Thank you for choosing E-Bikes Platform! 🚴‍♂️⚡
            </p>
          </div>
        </div>
      `,
      text: `
        Order Confirmed! - E-Bikes Platform
        Order #${orderId}
        
        Hello ${customerName}!
        
        Thank you for your order! We've received your request and will process it shortly.
        
        Order Details:
        - Order ID: ${orderId}
        - Items:
        ${itemsText}
        - Subtotal: ${subtotal}
        - Delivery: ${deliveryCost}
        - Total: ${totalAmount}
        ${depositAmount ? `- Deposit Required: ${depositAmount}` : ''}
        
        Delivery Information:
        - Method: ${deliveryMethod}
        ${deliveryAddress ? `- Address: ${deliveryAddress}` : ''}
        - Payment: ${paymentMethod}
        
        What's Next:
        • We'll contact you shortly to confirm payment details
        • Your order will be prepared for ${deliveryMethod.toLowerCase()}
        • You'll receive updates on your order status
        • Track your order progress via WhatsApp
        
        If you have any questions about your order, please contact our support team.
        Thank you for choosing E-Bikes Platform!
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${email}:`, result.messageId);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send order confirmation email to ${email}:`, error.message);
    throw error;
  }
};

// Send payment receipt email
export const sendPaymentReceiptEmail = async (email, receiptDetails) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email not configured');
    }

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'E-Bikes Platform';

    const itemsList = receiptDetails.items.map(item => 
      `<li style="margin: 5px 0;">${item.name} (x${item.quantity}) - KSh ${item.price.toFixed(2)}</li>`
    ).join('');

    const paymentDetails = receiptDetails.paymentMethod === 'M-Pesa' 
      ? `<p><strong>M-Pesa Code:</strong> ${receiptDetails.mpesaCode}</p>`
      : receiptDetails.paymentMethod === 'Bank Transfer'
      ? `<p><strong>Bank:</strong> ${receiptDetails.bankDetails?.bankName}</p>
         <p><strong>Reference:</strong> ${receiptDetails.bankReference}</p>`
      : '';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `Payment Receipt #${receiptDetails.receiptNumber} - E-Bikes Platform`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🧾 Payment Receipt</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Receipt #${receiptDetails.receiptNumber}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${receiptDetails.customerName}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for your payment! Here's your official receipt for Order #${receiptDetails.orderId}.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #333; margin-top: 0;">💳 Payment Details</h3>
              <p><strong>Receipt Number:</strong> ${receiptDetails.receiptNumber}</p>
              <p><strong>Order ID:</strong> ${receiptDetails.orderId}</p>
              <p><strong>Payment Method:</strong> ${receiptDetails.paymentMethod}</p>
              ${paymentDetails}
              <p><strong>Amount Paid:</strong> KSh ${receiptDetails.amount.toFixed(2)}</p>
              <p><strong>Payment Date:</strong> ${new Date(receiptDetails.paymentDate).toLocaleString()}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
             <h3 style="color: #333; margin-top: 0;">📦 Items Purchased</h3>
             <ul style="color: #666; margin: 10px 0; padding-left: 20px;">${itemsList}</ul>
           </div>
           
           <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
             <p style="color: #2e7d32; margin: 0; font-size: 14px;">
               <strong>✅ Payment Confirmed!</strong> Your order is now being processed and you'll receive updates on its status.
             </p>
           </div>
           
           <div style="text-align: center; margin: 30px 0;">
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${receiptDetails.orderId}" 
                style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
               Track Your Order
             </a>
           </div>
           
           <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
           
           <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
             Keep this receipt for your records. If you have any questions, please contact our support team.<br>
             Thank you for choosing E-Bikes Platform! 🚴‍♂️⚡
           </p>
         </div>
       </div>
     `,
     text: `
       Payment Receipt #${receiptDetails.receiptNumber} - E-Bikes Platform
       
       Hello ${receiptDetails.customerName}!
       
       Thank you for your payment! Here's your official receipt for Order #${receiptDetails.orderId}.
       
       Payment Details:
       - Receipt Number: ${receiptDetails.receiptNumber}
       - Order ID: ${receiptDetails.orderId}
       - Payment Method: ${receiptDetails.paymentMethod}
       ${receiptDetails.paymentMethod === 'M-Pesa' ? `- M-Pesa Code: ${receiptDetails.mpesaCode}` : ''}
       - Amount Paid: KSh ${receiptDetails.amount.toFixed(2)}
       - Payment Date: ${new Date(receiptDetails.paymentDate).toLocaleString()}
       
       Items Purchased:
       ${receiptDetails.items.map(item => `- ${item.name} (x${item.quantity}) - KSh ${item.price.toFixed(2)}`).join('\n')}
       
       Payment Confirmed! Your order is now being processed.
       
       Thank you for choosing E-Bikes Platform!
     `
   };

   const result = await transporter.sendMail(mailOptions);
   console.log(`✅ Payment receipt email sent to ${email}:`, result.messageId);
   return true;
 } catch (error) {
   console.error(`❌ Failed to send payment receipt email to ${email}:`, error.message);
   throw error;
 }
};

// Send bank transfer details email
export const sendBankTransferDetailsEmail = async (email, transferDetails) => {
 try {
   const transporter = createTransporter();
   
   if (!transporter) {
     throw new Error('Email not configured');
   }

   const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
   const fromName = process.env.SMTP_FROM_NAME || 'E-Bikes Platform';

   const instructionsList = transferDetails.instructions.map(instruction => 
     `<li style="margin: 8px 0; color: #666;">${instruction}</li>`
   ).join('');

   const mailOptions = {
     from: `"${fromName}" <${fromEmail}>`,
     to: email,
     subject: `Bank Transfer Details - Order #${transferDetails.orderId}`,
     html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
         <div style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
           <h1 style="margin: 0; font-size: 28px;">🏦 Bank Transfer Details</h1>
           <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order #${transferDetails.orderId}</p>
         </div>
         
         <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
           <h2 style="color: #333; margin-top: 0;">Hello ${transferDetails.customerName}!</h2>
           
           <p style="color: #666; line-height: 1.6; font-size: 16px;">
             Please use the bank details below to complete your payment for Order #${transferDetails.orderId}.
           </p>
           
           <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2196f3;">
             <h3 style="color: #333; margin-top: 0;">🏦 Bank Account Details</h3>
             <table style="width: 100%; border-collapse: collapse;">
               <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Bank Name:</td><td style="padding: 8px 0; color: #666;">${transferDetails.bankDetails.bankName}</td></tr>
               <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Account Number:</td><td style="padding: 8px 0; color: #666; font-family: monospace; font-size: 16px;">${transferDetails.bankDetails.accountNumber}</td></tr>
               <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Account Name:</td><td style="padding: 8px 0; color: #666;">${transferDetails.bankDetails.accountName}</td></tr>
               <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Branch Code:</td><td style="padding: 8px 0; color: #666;">${transferDetails.bankDetails.branchCode}</td></tr>
               <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Amount:</td><td style="padding: 8px 0; color: #2e7d32; font-weight: bold; font-size: 18px;">KSh ${transferDetails.amount.toFixed(2)}</td></tr>
               <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Reference:</td><td style="padding: 8px 0; color: #f44336; font-weight: bold; font-family: monospace;">${transferDetails.referenceNumber}</td></tr>
             </table>
           </div>
           
           <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
             <h3 style="color: #ef6c00; margin-top: 0;">📋 Important Instructions</h3>
             <ol style="color: #666; margin: 10px 0; padding-left: 20px;">
               ${instructionsList}
             </ol>
           </div>
           
           <div style="text-align: center; margin: 30px 0;">
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/proof-upload?ref=${transferDetails.referenceNumber}" 
                style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 10px;">
               📤 Upload Proof of Payment
             </a>
           </div>
           
           <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
             <p style="color: #1976d2; margin: 0; font-size: 14px;">
               <strong>💡 Quick Tip:</strong> Most banks allow instant transfers via mobile banking. Use the reference number exactly as shown above.
             </p>
           </div>
           
           <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
           
           <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
             Your payment will be verified within 24 hours after submission.<br>
             Need help? Contact our support team anytime.
           </p>
         </div>
       </div>
     `,
     text: `
       Bank Transfer Details - Order #${transferDetails.orderId}
       
       Hello ${transferDetails.customerName}!
       
       Please use the bank details below to complete your payment:
       
       Bank Account Details:
       - Bank Name: ${transferDetails.bankDetails.bankName}
       - Account Number: ${transferDetails.bankDetails.accountNumber}
       - Account Name: ${transferDetails.bankDetails.accountName}
       - Branch Code: ${transferDetails.bankDetails.branchCode}
       - Amount: KSh ${transferDetails.amount.toFixed(2)}
       - Reference: ${transferDetails.referenceNumber}
       
       Instructions:
       ${transferDetails.instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}
       
       Upload proof: ${process.env.FRONTEND_URL}/payments/proof-upload?ref=${transferDetails.referenceNumber}
       
       Payment will be verified within 24 hours.
     `
   };

   const result = await transporter.sendMail(mailOptions);
   console.log(`✅ Bank transfer details email sent to ${email}:`, result.messageId);
   return true;
 } catch (error) {
   console.error(`❌ Failed to send bank transfer details email to ${email}:`, error.message);
   throw error;
 }
};

// Send bank transfer confirmation email
export const sendBankTransferConfirmationEmail = async (email, confirmationDetails) => {
 try {
   const transporter = createTransporter();
   
   if (!transporter) {
     throw new Error('Email not configured');
   }

   const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
   const fromName = process.env.SMTP_FROM_NAME || 'E-Bikes Platform';

   const mailOptions = {
     from: `"${fromName}" <${fromEmail}>`,
     to: email,
     subject: `Proof of Payment Received - ${confirmationDetails.referenceNumber}`,
     html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
         <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
           <h1 style="margin: 0; font-size: 28px;">✅ Proof Received</h1>
           <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Reference: ${confirmationDetails.referenceNumber}</p>
         </div>
         
         <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
           <h2 style="color: #333; margin-top: 0;">Hello ${confirmationDetails.customerName}!</h2>
           
           <p style="color: #666; line-height: 1.6; font-size: 16px;">
             We have successfully received your proof of payment for Order #${confirmationDetails.orderId}.
           </p>
           
           <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
             <h3 style="color: #2e7d32; margin-top: 0;">🕐 What happens next?</h3>
             <ul style="color: #2e7d32; margin: 10px 0; padding-left: 20px;">
               <li>Our team will verify your payment within 24 hours</li>
               <li>You'll receive an email confirmation once verified</li>
               <li>Your order will then be processed for delivery/pickup</li>
               <li>A receipt will be sent to you after verification</li>
             </ul>
           </div>
           
           <div style="text-align: center; margin: 30px 0;">
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${confirmationDetails.orderId}" 
                style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
               Track Order Status
             </a>
           </div>
           
           <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
           
           <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
             Thank you for your patience. We'll notify you as soon as your payment is verified.<br>
             E-Bikes Platform Team 🚴‍♂️⚡
           </p>
         </div>
       </div>
     `,
     text: `
       Proof of Payment Received - ${confirmationDetails.referenceNumber}
       
       Hello ${confirmationDetails.customerName}!
       
       We have successfully received your proof of payment for Order #${confirmationDetails.orderId}.
       
       What happens next:
       - Our team will verify your payment within 24 hours
       - You'll receive an email confirmation once verified
       - Your order will then be processed for delivery/pickup
       - A receipt will be sent to you after verification
       
       Thank you for your patience!
       E-Bikes Platform Team
     `
   };

   const result = await transporter.sendMail(mailOptions);
   console.log(`✅ Bank transfer confirmation email sent to ${email}:`, result.messageId);
   return true;
 } catch (error) {
   console.error(`❌ Failed to send bank transfer confirmation email to ${email}:`, error.message);
   throw error;
 }
};

// Send bank transfer verification email
export const sendBankTransferVerificationEmail = async (email, verificationDetails) => {
 try {
   const transporter = createTransporter();
   
   if (!transporter) {
     throw new Error('Email not configured');
   }

   const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
   const fromName = process.env.SMTP_FROM_NAME || 'E-Bikes Platform';

   const isVerified = verificationDetails.verified;
   const statusColor = isVerified ? '#4caf50' : '#f44336';
   const statusIcon = isVerified ? '✅' : '❌';
   const statusText = isVerified ? 'Payment Verified' : 'Payment Rejected';

   const mailOptions = {
     from: `"${fromName}" <${fromEmail}>`,
     to: email,
     subject: `${statusText} - Order #${verificationDetails.orderId}`,
     html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
         <div style="background: ${statusColor}; padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
           <h1 style="margin: 0; font-size: 28px;">${statusIcon} ${statusText}</h1>
           <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order #${verificationDetails.orderId}</p>
         </div>
         
         <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
           <h2 style="color: #333; margin-top: 0;">Hello ${verificationDetails.customerName}!</h2>
           
           <p style="color: #666; line-height: 1.6; font-size: 16px;">
             ${isVerified 
               ? 'Great news! Your bank transfer payment has been verified and confirmed.'
               : 'We regret to inform you that your bank transfer payment could not be verified.'}
           </p>
           
           ${verificationDetails.notes ? `
           <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
             <h3 style="color: #333; margin-top: 0;">📝 ${isVerified ? 'Verification Notes' : 'Reason for Rejection'}</h3>
             <p style="color: #666; margin: 0;">${verificationDetails.notes}</p>
           </div>
           ` : ''}
           
           ${isVerified ? `
           <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
             <h3 style="color: #2e7d32; margin-top: 0;">🎉 What's Next?</h3>
             <ul style="color: #2e7d32; margin: 10px 0; padding-left: 20px;">
               <li>Your order is now confirmed and being processed</li>
               <li>You'll receive a payment receipt shortly</li>
               <li>We'll notify you when your order is ready for delivery/pickup</li>
               <li>Track your order status using the link below</li>
             </ul>
           </div>
           ` : `
           <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
             <h3 style="color: #c62828; margin-top: 0;">🔄 Next Steps</h3>
             <ul style="color: #c62828; margin: 10px 0; padding-left: 20px;">
               <li>Please review the rejection reason above</li>
               <li>You can submit a new proof of payment if needed</li>
               <li>Contact our support team for assistance</li>
               <li>Alternative payment methods are available</li>
             </ul>
           </div>
           `}
           
           <div style="text-align: center; margin: 30px 0;">
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${verificationDetails.orderId}" 
                style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 5px;">
               View Order Details
             </a>
             ${!isVerified ? `
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" 
                style="background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 5px;">
               Contact Support
             </a>
             ` : ''}
           </div>
           
           <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
           
           <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
             Verification completed on ${new Date(verificationDetails.verificationDate).toLocaleString()}<br>
             ${isVerified ? 'Thank you for your business!' : 'We apologize for any inconvenience.'} E-Bikes Platform Team 🚴‍♂️⚡
           </p>
         </div>
       </div>
     `,
     text: `
       ${statusText} - Order #${verificationDetails.orderId}
       
       Hello ${verificationDetails.customerName}!
       
       ${isVerified 
         ? 'Great news! Your bank transfer payment has been verified and confirmed.'
         : 'We regret to inform you that your bank transfer payment could not be verified.'}
       
       ${verificationDetails.notes ? `${isVerified ? 'Verification Notes' : 'Reason for Rejection'}:\n${verificationDetails.notes}\n` : ''}
       
       ${isVerified ? `
What's Next:
- Your order is now confirmed and being processed
- You'll receive a payment receipt shortly
- We'll notify you when your order is ready for delivery/pickup
- Track your order status at: ${process.env.FRONTEND_URL}/orders/${verificationDetails.orderId}
       ` : `
Next Steps:
- Please review the rejection reason above
- You can submit a new proof of payment if needed
- Contact our support team for assistance
- Alternative payment methods are available
       `}
       
       Verification completed on ${new Date(verificationDetails.verificationDate).toLocaleString()}
       ${isVerified ? 'Thank you for your business!' : 'We apologize for any inconvenience.'}
       E-Bikes Platform Team
     `
   };

   const result = await transporter.sendMail(mailOptions);
   console.log(`✅ Bank transfer verification email sent to ${email}:`, result.messageId);
   return true;
 } catch (error) {
   console.error(`❌ Failed to send bank transfer verification email to ${email}:`, error.message);
   throw error;
 }
};

// Send test email (for debugging)
export const sendTestEmail = async (email, name = 'Test User') => {
 try {
   const transporter = createTransporter();
   
   if (!transporter) {
     throw new Error('Email not configured');
   }

   const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
   const fromName = process.env.SMTP_FROM_NAME || 'E-Bikes Platform';

   const mailOptions = {
     from: `"${fromName}" <${fromEmail}>`,
     to: email,
     subject: '🧪 Test Email - E-Bikes Platform',
     html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
         <div style="background: #2196f3; padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
           <h1 style="margin: 0; font-size: 28px;">🧪 Test Email</h1>
           <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">E-Bikes Platform Email System</p>
         </div>
         
         <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
           <h2 style="color: #333; margin-top: 0;">Hello ${name}! 👋</h2>
           
           <p style="color: #666; line-height: 1.6; font-size: 16px;">
             This is a test email to verify that the E-Bikes platform email system is working correctly.
           </p>
           
           <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
             <h3 style="color: #333; margin-top: 0;">✅ Email System Status</h3>
             <ul style="color: #666; line-height: 1.8;">
               <li>SMTP Configuration: Working</li>
               <li>Email Authentication: Successful</li>
               <li>Template Rendering: Functional</li>
               <li>Email Delivery: Operational</li>
             </ul>
           </div>
           
           <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
             <p style="color: #2e7d32; margin: 0; font-size: 14px;">
               <strong>✅ Success!</strong> If you're reading this, the email system is working perfectly.
             </p>
           </div>
           
           <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
           
           <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
             Test email sent at: ${new Date().toLocaleString()}<br>
             E-Bikes Platform - Email Testing System
           </p>
         </div>
       </div>
     `,
     text: `
       Test Email - E-Bikes Platform
       
       Hello ${name}!
       
       This is a test email to verify that the E-Bikes platform email system is working correctly.
       
       Email System Status:
       - SMTP Configuration: Working
       - Email Authentication: Successful
       - Template Rendering: Functional
       - Email Delivery: Operational
       
       Success! If you're reading this, the email system is working perfectly.
       
       Test email sent at: ${new Date().toLocaleString()}
       E-Bikes Platform - Email Testing System
     `
   };

   const result = await transporter.sendMail(mailOptions);
   console.log(`✅ Test email sent to ${email}:`, result.messageId);
   return true;
 } catch (error) {
   console.error(`❌ Failed to send test email to ${email}:`, error.message);
   throw error;
 }
};

// Send notification email (for admin alerts)
export const sendNotificationEmail = async (adminEmail, subject, message, details = {}) => {
 try {
   const transporter = createTransporter();
   
   if (!transporter) {
     throw new Error('Email not configured');
   }

   const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
   const fromName = process.env.SMTP_FROM_NAME || 'E-Bikes Platform';

   const detailsList = Object.entries(details).map(([key, value]) => 
     `<li><strong>${key}:</strong> ${value}</li>`
   ).join('');

   const detailsText = Object.entries(details).map(([key, value]) => 
     `- ${key}: ${value}`
   ).join('\n');

   const mailOptions = {
     from: `"${fromName}" <${fromEmail}>`,
     to: adminEmail,
     subject: `🔔 ${subject} - E-Bikes Platform`,
     html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
         <div style="background: #ff9800; padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
           <h1 style="margin: 0; font-size: 28px;">🔔 Notification</h1>
           <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">E-Bikes Platform Admin Alert</p>
         </div>
         
         <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
           <h2 style="color: #333; margin-top: 0;">${subject}</h2>
           
           <p style="color: #666; line-height: 1.6; font-size: 16px;">
             ${message}
           </p>
           
           ${detailsList ? `
           <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
             <h3 style="color: #333; margin-top: 0;">📋 Details</h3>
             <ul style="color: #666; margin: 10px 0; padding-left: 20px;">${detailsList}</ul>
           </div>
           ` : ''}
           
           <div style="text-align: center; margin: 30px 0;">
             <a href="${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/debug" 
                style="background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
               Check System Status
             </a>
           </div>
           
           <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
           
           <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
             Notification sent at: ${new Date().toLocaleString()}<br>
             E-Bikes Platform - Admin Notification System
           </p>
         </div>
       </div>
     `,
     text: `
       Notification - E-Bikes Platform
       
       ${subject}
       
       ${message}
       
       ${detailsText ? `Details:\n${detailsText}` : ''}
       
       Notification sent at: ${new Date().toLocaleString()}
       E-Bikes Platform - Admin Notification System
     `
   };

   const result = await transporter.sendMail(mailOptions);
   console.log(`✅ Notification email sent to ${adminEmail}:`, result.messageId);
   return true;
 } catch (error) {
   console.error(`❌ Failed to send notification email to ${adminEmail}:`, error.message);
   throw error;
 }
};

// Bulk email sender (for marketing/newsletters)
export const sendBulkEmail = async (recipients, subject, htmlContent, textContent) => {
 try {
   const transporter = createTransporter();
   
   if (!transporter) {
     throw new Error('Email not configured');
   }

   const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
   const fromName = process.env.SMTP_FROM_NAME || 'E-Bikes Platform';

   const results = [];

   // Send emails in batches to avoid rate limiting
   const batchSize = 10;
   for (let i = 0; i < recipients.length; i += batchSize) {
     const batch = recipients.slice(i, i + batchSize);
     
     const batchPromises = batch.map(async (recipient) => {
       try {
         const mailOptions = {
           from: `"${fromName}" <${fromEmail}>`,
           to: recipient.email,
           subject: subject,
           html: htmlContent.replace(/{{name}}/g, recipient.name || 'Valued Customer'),
           text: textContent.replace(/{{name}}/g, recipient.name || 'Valued Customer'),
         };

         const result = await transporter.sendMail(mailOptions);
         console.log(`✅ Bulk email sent to ${recipient.email}:`, result.messageId);
         return { email: recipient.email, success: true, messageId: result.messageId };
       } catch (error) {
         console.error(`❌ Failed to send bulk email to ${recipient.email}:`, error.message);
         return { email: recipient.email, success: false, error: error.message };
       }
     });

     const batchResults = await Promise.all(batchPromises);
     results.push(...batchResults);

     // Wait between batches to avoid rate limiting
     if (i + batchSize < recipients.length) {
       await new Promise(resolve => setTimeout(resolve, 1000));
     }
   }

   const successCount = results.filter(r => r.success).length;
   const failureCount = results.filter(r => !r.success).length;

   console.log(`📊 Bulk email results: ${successCount} sent, ${failureCount} failed`);
   
   return {
     total: recipients.length,
     sent: successCount,
     failed: failureCount,
     results: results
   };
 } catch (error) {
   console.error('💥 Bulk email sending failed:', error);
   throw error;
 }
};

// Email template validator
export const validateEmailTemplate = (template) => {
 const requiredFields = ['subject', 'html', 'text'];
 const missingFields = requiredFields.filter(field => !template[field]);
 
 if (missingFields.length > 0) {
   throw new Error(`Missing required template fields: ${missingFields.join(', ')}`);
 }

 // Basic HTML validation
 if (!template.html.includes('<html>') || !template.html.includes('</html>')) {
   console.warn('⚠️ Email template may be missing proper HTML structure');
 }

 // Check for template variables
 const htmlVariables = (template.html.match(/\{\{(\w+)\}\}/g) || []).map(v => v.slice(2, -2));
 const textVariables = (template.text.match(/\{\{(\w+)\}\}/g) || []).map(v => v.slice(2, -2));
 
 return {
   valid: true,
   htmlVariables: [...new Set(htmlVariables)],
   textVariables: [...new Set(textVariables)],
   warnings: htmlVariables.length !== textVariables.length ? 
     ['HTML and text templates have different variables'] : []
 };
};

// Get email statistics
export const getEmailStats = () => {
 // This would typically connect to a database to get actual stats
 // For now, return mock data
 return {
   totalSent: 0,
   totalFailed: 0,
   lastSent: null,
   configurationStatus: !!createTransporter(),
   smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
   smtpPort: process.env.SMTP_PORT || '587',
   fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'Not configured'
 };
};

// Export all functions
export default {
 testEmailConfiguration,
 sendPasswordSetupEmail,
 sendWelcomeEmail,
 sendPasswordResetEmail,
 sendVerificationEmail,
 sendOrderConfirmationEmail,
 sendPaymentReceiptEmail,
 sendBankTransferDetailsEmail,
 sendBankTransferConfirmationEmail,
 sendBankTransferVerificationEmail,
 sendTestEmail,
 sendNotificationEmail,
 sendBulkEmail,
 validateEmailTemplate,
 getEmailStats
};