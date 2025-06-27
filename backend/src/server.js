// src/server.js
import express      from "express";
import cors         from "cors";
import cookieParser from "cookie-parser";
import dotenv       from "dotenv";
import path         from "node:path";
import fs           from "node:fs";

import { initDB, db }   from "./config/db.js";
import employeeRoutes   from "./routes/employees.js";
import itemRoutes       from "./routes/items.js";
import authRoutes       from "./routes/auth.js";
import paymentRoutes    from "./routes/payments.js";
import { authenticate } from "./middleware/auth.js";
import { testEmailConfiguration } from "./services/emailService.js";
import User from "./models/User.js";

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';

dotenv.config({ path: envFile });

// Log environment info
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📄 Loading config from: ${envFile}`);
console.log(`🔗 BASE_URL: ${process.env.BASE_URL || 'Not set'}`);
console.log(`🎯 FRONTEND_URL: ${process.env.FRONTEND_URL || 'Not set'}`);

// Function to create payment tables if they don't exist
async function createPaymentTables() {
  try {
    console.log('🔧 Creating payment system tables...');
    
    // Create orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(255),
        delivery_method ENUM('delivery', 'pickup') NOT NULL,
        delivery_address TEXT,
        delivery_cost DECIMAL(10,2) DEFAULT 0,
        delivery_distance DECIMAL(8,2) DEFAULT 0,
        subtotal DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        deposit_amount DECIMAL(10,2) NOT NULL,
        total_deposit_due DECIMAL(10,2) NOT NULL,
        payment_method ENUM('mpesa', 'bank_transfer') NOT NULL,
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        order_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        admin_notes TEXT,
        user_id INT,
        google_user BOOLEAN DEFAULT FALSE,
        registration_status VARCHAR(50),
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_order_number (order_number),
        INDEX idx_customer_email (customer_email),
        INDEX idx_payment_status (payment_status),
        INDEX idx_order_status (order_status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create order_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        item_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        item_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_item_id (item_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create delivery_locations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS delivery_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        address TEXT NOT NULL,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        place_id VARCHAR(255),
        location_types JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create mpesa_transactions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS mpesa_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        merchant_request_id VARCHAR(255),
        checkout_request_id VARCHAR(255),
        response_code VARCHAR(10),
        response_description TEXT,
        customer_message TEXT,
        phone_number VARCHAR(20),
        amount DECIMAL(10,2),
        account_reference VARCHAR(255),
        transaction_desc TEXT,
        stk_push_sent BOOLEAN DEFAULT FALSE,
        stk_push_response JSON,
        callback_received BOOLEAN DEFAULT FALSE,
        callback_data JSON,
        status ENUM('pending', 'success', 'failed', 'cancelled', 'timeout') DEFAULT 'pending',
        result_code VARCHAR(10),
        result_desc TEXT,
        mpesa_receipt_number VARCHAR(255),
        transaction_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_checkout_request_id (checkout_request_id),
        INDEX idx_mpesa_receipt_number (mpesa_receipt_number),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create bank_transfers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS bank_transfers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        reference_number VARCHAR(255) UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        bank_name VARCHAR(255),
        account_number VARCHAR(255),
        account_name VARCHAR(255),
        transfer_date DATE,
        proof_of_payment VARCHAR(255),
        status ENUM('pending', 'submitted', 'verified', 'rejected') DEFAULT 'pending',
        verified BOOLEAN DEFAULT FALSE,
        verified_by INT,
        verified_at TIMESTAMP NULL,
        verification_notes TEXT,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_reference_number (reference_number),
        INDEX idx_status (status),
        INDEX idx_verified (verified)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create payment_receipts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_receipts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        receipt_number VARCHAR(255) UNIQUE NOT NULL,
        order_id INT NOT NULL,
        payment_type ENUM('mpesa', 'bank_transfer') NOT NULL,
        transaction_id INT,
        amount DECIMAL(10,2) NOT NULL,
        payment_date TIMESTAMP NOT NULL,
        receipt_data JSON,
        email_sent BOOLEAN DEFAULT FALSE,
        email_sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_receipt_number (receipt_number),
        INDEX idx_payment_type (payment_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Payment system tables created/verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating payment tables:', error);
    return false;
  }
}

async function startServer() {
  await initDB();

  // Initialize User table and test email configuration
  try {
    const userModel = new User(db);
    await userModel.createTable();
    console.log('✅ User model initialized successfully');
    
    // Create payment system tables
    await createPaymentTables();
    
    // Test email configuration
    const emailConfigValid = await testEmailConfiguration();
    if (emailConfigValid) {
      console.log('📧 Email configuration verified successfully');
    } else {
      console.log('⚠️  Email configuration failed - check your email settings in .env');
    }

    // Test M-Pesa configuration
    const mpesaConfigured = !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET);
    console.log(`💳 M-Pesa configured: ${mpesaConfigured}`);
    
    // Test Bank Transfer configuration
    const bankConfigured = !!(process.env.BANK_ACCOUNT_NUMBER && process.env.BANK_ACCOUNT_NAME);
    console.log(`🏦 Bank Transfer configured: ${bankConfigured}`);
    
  } catch (error) {
    console.error('❌ Error initializing user system:', error);
  }

  /* ─ create uploads directories ─ */
  const uploadsPath = path.join("uploads/items");
  const paymentsUploadsPath = path.join("uploads/payments");
  
  fs.mkdirSync(uploadsPath, { recursive: true });
  fs.mkdirSync(paymentsUploadsPath, { recursive: true });
  
  console.log(`📁 Uploads directory created/verified: ${path.resolve(uploadsPath)}`);
  console.log(`💰 Payments uploads directory created/verified: ${path.resolve(paymentsUploadsPath)}`);

  const app = express();

  /* ─ Enhanced CORS with environment variables ─ */
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.BASE_URL,
    "http://localhost:3000",
    "http://localhost:5173"
  ].filter(Boolean);

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return callback(null, true);
      }
      
      console.log(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));

  console.log(`🔐 CORS allowed origins: ${allowedOrigins.join(', ')}`);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  /* ─ Debug middleware to log all requests ─ */
  app.use((req, res, next) => {
    if (req.url.startsWith('/uploads') || req.url.startsWith('/api')) {
      console.log(`📋 ${req.method} ${req.url} from ${req.get('origin') || 'direct'}`);
    }
    next();
  });

  /* ─ static images with detailed logging ─ */
  app.use("/uploads/items", (req, res, next) => {
    const requestedFile = path.join(uploadsPath, req.url);
    console.log(`📷 Image requested: ${req.url}`);
    console.log(`📍 Full path: ${requestedFile}`);
    
    if (fs.existsSync(requestedFile)) {
      console.log(`✅ File exists: ${requestedFile}`);
      
      const ext = path.extname(requestedFile).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      
      if (mimeTypes[ext]) {
        res.setHeader('Content-Type', mimeTypes[ext]);
      }
      
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('ETag', `"${fs.statSync(requestedFile).mtime.getTime()}"`);
      
    } else {
      console.log(`❌ File not found: ${requestedFile}`);
      
      try {
        const dirPath = path.dirname(requestedFile);
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath);
          console.log(`📁 Files in ${dirPath}:`, files);
        } else {
          console.log(`📁 Directory doesn't exist: ${dirPath}`);
          
          const parentDir = path.dirname(dirPath);
          if (fs.existsSync(parentDir)) {
            const parentFiles = fs.readdirSync(parentDir);
            console.log(`📁 Parent directory ${parentDir} contains:`, parentFiles);
          }
        }
      } catch (err) {
        console.log(`📁 Error reading directory: ${err.message}`);
      }
    }
    next();
  }, express.static(path.resolve("uploads/items")));

  /* ─ static payment proofs serving ─ */
  app.use("/uploads/payments", (req, res, next) => {
    // Only allow authenticated users to access payment proofs
    // You might want to add more specific access control here
    console.log(`📄 Payment proof requested: ${req.url}`);
    next();
  }, express.static(path.resolve("uploads/payments")));

  /* ─ Enhanced health check ─ */
  app.get("/api/health", async (req, res) => {
    try { 
      await db.query("SELECT 1"); 
      
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
      
      let userTableStatus = false;
      let paymentTablesStatus = false;
      
      try {
        const userModel = new User(db);
        await db.query("SELECT COUNT(*) FROM users");
        userTableStatus = true;
      } catch (error) {
        console.log('User table check failed:', error.message);
      }

      try {
        await db.query("SELECT COUNT(*) FROM orders");
        await db.query("SELECT COUNT(*) FROM mpesa_transactions");
        await db.query("SELECT COUNT(*) FROM bank_transfers");
        paymentTablesStatus = true;
      } catch (error) {
        console.log('Payment tables check failed:', error.message);
      }
      
      res.json({ 
        ok: true, 
        uploads_path: path.resolve(uploadsPath),
        payments_uploads_path: path.resolve(paymentsUploadsPath),
        server_time: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        base_url: baseUrl,
        frontend_url: process.env.FRONTEND_URL,
        version: '2.0.0',
        user_table_ok: userTableStatus,
        payment_tables_ok: paymentTablesStatus,
        email_configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
        google_auth_configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        mpesa_configured: !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET),
        bank_transfer_configured: !!(process.env.BANK_ACCOUNT_NUMBER && process.env.BANK_ACCOUNT_NAME)
      }); 
    }
    catch (error) { 
      res.status(500).json({ 
        ok: false, 
        error: "DB offline",
        details: error.message 
      }); 
    }
  });

  /* ─ Enhanced test endpoint for uploads directory ─ */
  app.get("/api/test-uploads", (req, res) => {
    try {
      const uploadsDir = path.resolve("uploads/items");
      const paymentsDir = path.resolve("uploads/payments");
      const exists = fs.existsSync(uploadsDir);
      const paymentsExists = fs.existsSync(paymentsDir);
      
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      
      let structure = {};
      let paymentsStructure = {};
      let totalFiles = 0;
      let totalSize = 0;
      
      if (exists) {
        try {
          const items = fs.readdirSync(uploadsDir);
          items.forEach(item => {
            const itemPath = path.join(uploadsDir, item);
            const stats = fs.statSync(itemPath);
            if (stats.isDirectory()) {
              try {
                const files = fs.readdirSync(itemPath);
                structure[item] = files.map(file => {
                  const filePath = path.join(itemPath, file);
                  const fileStats = fs.statSync(filePath);
                  totalFiles++;
                  totalSize += fileStats.size;
                  
                  return {
                    name: file,
                    url: `${baseUrl}/uploads/items/${item}/${file}`,
                    size: fileStats.size,
                    modified: fileStats.mtime.toISOString()
                  };
                });
              } catch (err) {
                structure[item] = `Error: ${err.message}`;
              }
            }
          });
        } catch (err) {
          structure = { error: err.message };
        }
      }

      if (paymentsExists) {
        try {
          const payments = fs.readdirSync(paymentsDir);
          paymentsStructure = {
            total_files: payments.length,
            files: payments.slice(0, 5).map(file => ({ name: file, size: fs.statSync(path.join(paymentsDir, file)).size }))
          };
        } catch (err) {
          paymentsStructure = { error: err.message };
        }
      }

      res.json({
        uploads_directory_exists: exists,
        payments_directory_exists: paymentsExists,
        uploads_path: uploadsDir,
        payments_path: paymentsDir,
        base_url: baseUrl,
        structure: structure,
        payments_structure: paymentsStructure,
        statistics: {
          total_directories: Object.keys(structure).length,
          total_files: totalFiles,
          total_size_bytes: totalSize,
          total_size_mb: Math.round(totalSize / (1024 * 1024) * 100) / 100
        },
        sample_urls: exists && Object.keys(structure).length > 0 
          ? Object.values(structure)[0]?.map?.(f => f.url) || []
          : [],
        environment_info: {
          NODE_ENV: process.env.NODE_ENV || 'development',
          BASE_URL: process.env.BASE_URL || 'Not set',
          FRONTEND_URL: process.env.FRONTEND_URL || 'Not set'
        }
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to check uploads",
        message: error.message
      });
    }
  });

  /* ─ Payment system test endpoint ─ */
  app.get("/api/test-payments", async (req, res) => {
    try {
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      
      // Test database tables
      let tablesStatus = {};
      const tables = ['orders', 'order_items', 'mpesa_transactions', 'bank_transfers', 'payment_receipts'];
      
      for (const table of tables) {
        try {
          const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
          tablesStatus[table] = { exists: true, count: rows[0].count };
        } catch (error) {
          tablesStatus[table] = { exists: false, error: error.message };
        }
      }

      // Test M-Pesa configuration
      const mpesaConfig = {
        consumer_key: !!process.env.MPESA_CONSUMER_KEY,
        consumer_secret: !!process.env.MPESA_CONSUMER_SECRET,
        business_shortcode: !!process.env.MPESA_BUSINESS_SHORTCODE,
        passkey: !!process.env.MPESA_PASSKEY,
        callback_url: !!process.env.MPESA_CALLBACK_URL,
        environment: process.env.MPESA_ENVIRONMENT || 'sandbox'
      };

      // Test Bank Transfer configuration
      const bankConfig = {
        bank_name: !!process.env.BANK_NAME,
        account_number: !!process.env.BANK_ACCOUNT_NUMBER,
        account_name: !!process.env.BANK_ACCOUNT_NAME,
        branch_code: !!process.env.BANK_BRANCH_CODE
      };

      res.json({
        success: true,
        message: 'Payment system test completed',
        database_tables: tablesStatus,
        mpesa_configuration: mpesaConfig,
        bank_transfer_configuration: bankConfig,
        uploads_configured: fs.existsSync(path.resolve("uploads/payments")),
        test_endpoints: {
          create_order: `${baseUrl}/api/payments/orders`,
          mpesa_stk_push: `${baseUrl}/api/payments/mpesa/stk-push`,
          bank_transfer: `${baseUrl}/api/payments/bank-transfer`,
          mpesa_callback: `${baseUrl}/api/payments/mpesa/callback`,
          upload_proof: `${baseUrl}/api/payments/upload-proof`,
          payment_status: `${baseUrl}/api/payments/status/{orderId}/{paymentId}`
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Payment system test failed",
        message: error.message
      });
    }
  });

  /* ─ auth helpers ─ */
  app.get("/api/auth/me", authenticate, (req, res) =>
    res.json({ 
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    })
  );

  app.post("/api/auth/logout", (_req, res) =>
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure  : process.env.NODE_ENV === "production",
      path    : "/",
    }).json({ 
      success: true,
      message: "Logged out successfully" 
    })
  );

  /* ─ main routes ─ */
  app.use("/api/employees", employeeRoutes);
  app.use("/api/items",     itemRoutes);
  app.use("/api/auth",      authRoutes);
  app.use("/api/payments",  paymentRoutes);

  /* ─ fallback 404 for unknown API routes ─ */
  app.use("/api", (_req, res) => res.status(404).json({ 
    success: false,
    message: "API endpoint not found" 
  }));

  /* ─ Enhanced catch-all for testing static file serving ─ */
  app.get("/test-image", (req, res) => {
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>E-Bikes Platform Test Dashboard</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
            .section { background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .image-test { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .image-test img { max-width: 300px; border: 1px solid #ccc; margin: 10px; border-radius: 5px; }
            .error { color: red; font-style: italic; }
            .success { color: green; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }
            .warning { background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800; }
            .link { display: inline-block; margin: 10px; padding: 12px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; transition: all 0.3s; }
            .link:hover { background: #5a6fd8; transform: translateY(-2px); }
            .link.secondary { background: #4caf50; }
            .link.warning { background: #ff9800; }
            .link.danger { background: #f44336; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .status-badge { padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
            .status-ok { background: #4caf50; color: white; }
            .status-error { background: #f44336; color: white; }
            .status-warning { background: #ff9800; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚴‍♂️ E-Bikes Platform</h1>
              <p>Development Test Dashboard</p>
              <div class="info" style="background: rgba(255,255,255,0.1); border-left: none; color: white;">
                <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}<br>
                <strong>Base URL:</strong> ${baseUrl}<br>
                <strong>Version:</strong> 2.0.0 (Payment System Integrated)
              </div>
            </div>

            <div class="grid">
              <div class="section">
                <h3>🖼️ Image Serving Test</h3>
                <div class="image-test">
                  <p>Testing image uploads and serving:</p>
                  
                  <div>
                    <strong>Item 1:</strong><br>
                    <img src="/uploads/items/1/1.jpg" alt="Item 1 - Image 1" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                    <p class="error" style="display: none;">❌ /uploads/items/1/1.jpg not found</p>
                    
                    <img src="/uploads/items/1/2.jpg" alt="Item 1 - Image 2" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                    <p class="error" style="display: none;">❌ /uploads/items/1/2.jpg not found</p>
                  </div>
                </div>
              </div>

              <div class="section">
                <h3>🔧 System Status</h3>
                <div id="systemStatus">
                  <p>Loading system status...</p>
                </div>
              </div>

              <div class="section">
                <h3>💳 Payment System</h3>
                <div id="paymentStatus">
                  <p>Loading payment system status...</p>
                </div>
              </div>
            </div>

            <div class="section">
              <h3>🔧 Debug Tools</h3>
              <div class="grid">
                <div>
                  <h4>Core System</h4>
                  <a href="/api/health" class="link">❤️ Health Check</a>
                  <a href="/api/test-uploads" class="link">📁 Uploads Test</a>
                  <a href="/api/env" class="link">🌍 Environment Info</a>
                  <a href="/api/items/public" class="link secondary">📦 Items API</a>
                </div>
                <div>
                  <h4>Authentication</h4>
                  <a href="/api/auth/test" class="link">👤 Auth System</a>
                  <a href="/api/auth/debug" class="link">🔍 Auth Debug</a>
                  <a href="/api/auth/check-user" class="link secondary">👥 Check User</a>
                </div>
                <div>
                  <h4>Payment System</h4>
                  <a href="/api/test-payments" class="link warning">💳 Payment Test</a>
                  <a href="/api/payments/test" class="link secondary">📦 Payment Routes Test</a>
                  <a href="/uploads/payments" class="link">📄 Payment Proofs</a>
                </div>
              </div>
            </div>
          </div>

          <script>
            // Load system status
            fetch('/api/health')
              .then(response => response.json())
              .then(data => {
                const statusEl = document.getElementById('systemStatus');
                const items = [
                  { label: 'Database', status: data.ok ? 'ok' : 'error' },
                 { label: 'User System', status: data.user_table_ok ? 'ok' : 'error' },
                 { label: 'Payment Tables', status: data.payment_tables_ok ? 'ok' : 'error' },
                 { label: 'Email Config', status: data.email_configured ? 'ok' : 'warning' },
                 { label: 'Google Auth', status: data.google_auth_configured ? 'ok' : 'warning' },
                 { label: 'M-Pesa Config', status: data.mpesa_configured ? 'ok' : 'warning' },
                 { label: 'Bank Transfer', status: data.bank_transfer_configured ? 'ok' : 'warning' }
               ];
               
               statusEl.innerHTML = items.map(item => 
                 \`<span class="status-badge status-\${item.status}">\${item.label}</span>\`
               ).join(' ');
             })
             .catch(error => {
               document.getElementById('systemStatus').innerHTML = '<span class="status-badge status-error">Failed to load</span>';
             });

           // Load payment system status
           fetch('/api/test-payments')
             .then(response => response.json())
             .then(data => {
               const statusEl = document.getElementById('paymentStatus');
               if (data.success) {
                 const tables = Object.keys(data.database_tables);
                 const tablesOk = tables.filter(t => data.database_tables[t].exists).length;
                 statusEl.innerHTML = \`
                   <p><strong>Database Tables:</strong> \${tablesOk}/\${tables.length} OK</p>
                   <p><strong>M-Pesa:</strong> \${Object.values(data.mpesa_configuration).filter(Boolean).length}/6 configured</p>
                   <p><strong>Bank Transfer:</strong> \${Object.values(data.bank_transfer_configuration).filter(Boolean).length}/4 configured</p>
                 \`;
               } else {
                 statusEl.innerHTML = '<span class="status-badge status-error">Payment system error</span>';
               }
             })
             .catch(error => {
               document.getElementById('paymentStatus').innerHTML = '<span class="status-badge status-error">Failed to load</span>';
             });

           // Image loading test
           let successCount = 0;
           let totalCount = 0;
           
           document.querySelectorAll('img').forEach(img => {
             totalCount++;
             img.onload = function() {
               successCount++;
               this.nextElementSibling.style.display = 'none';
               const successMsg = document.createElement('p');
               successMsg.className = 'success';
               successMsg.textContent = '✅ Image loaded successfully';
               this.parentNode.insertBefore(successMsg, this.nextElementSibling);
             };
           });
         </script>
       </body>
     </html>
   `);
 });

 /* ─ Environment info endpoint ─ */
 app.get("/api/env", (req, res) => {
   res.json({
     NODE_ENV: process.env.NODE_ENV || 'development',
     BASE_URL: process.env.BASE_URL || 'Not set',
     FRONTEND_URL: process.env.FRONTEND_URL || 'Not set',
     PORT: process.env.PORT || 5000,
     current_base_url: process.env.BASE_URL || `${req.protocol}://${req.get('host')}`,
     request_host: req.get('host'),
     request_protocol: req.protocol,
     email_configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
     google_auth_configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
     mpesa_configured: !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET),
     bank_transfer_configured: !!(process.env.BANK_ACCOUNT_NUMBER && process.env.BANK_ACCOUNT_NAME),
     deposit_percentage: process.env.DEPOSIT_PERCENTAGE || '0.3'
   });
 });

 /* ─ boot ─ */
 const PORT = process.env.PORT || 5000;
 app.listen(PORT, () => {
   const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
   
   console.log(`🚀 API server running on port ${PORT}`);
   console.log(`🌐 Base URL: ${baseUrl}`);
   console.log(`📁 Uploads directory: ${path.resolve(uploadsPath)}`);
   console.log(`💰 Payment uploads directory: ${path.resolve(paymentsUploadsPath)}`);
   console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
   console.log(`📧 Email configured: ${!!(process.env.SMTP_USER && process.env.SMTP_PASS)}`);
   console.log(`🔐 Google Auth configured: ${!!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}`);
   console.log(`💳 M-Pesa configured: ${!!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET)}`);
   console.log(`🏦 Bank Transfer configured: ${!!(process.env.BANK_ACCOUNT_NUMBER && process.env.BANK_ACCOUNT_NAME)}`);
   console.log(`\n🔧 Test URLs:`);
   console.log(`   🖼️  Dashboard: ${baseUrl}/test-image`);
   console.log(`   📁  Uploads check: ${baseUrl}/api/test-uploads`);
   console.log(`   💳  Payment test: ${baseUrl}/api/test-payments`);
   console.log(`   📦  Items API: ${baseUrl}/api/items/public`);
   console.log(`   ❤️  Health check: ${baseUrl}/api/health`);
   console.log(`   🌍  Environment: ${baseUrl}/api/env`);
   console.log(`   👤  Auth system: ${baseUrl}/api/auth/test`);
   console.log(`   🔍  Auth debug: ${baseUrl}/api/auth/debug`);
   console.log(`\n💳 Payment Endpoints (CORRECTED):`);
   console.log(`   📦  Create order: ${baseUrl}/api/payments/orders`);
   console.log(`   💳  M-Pesa STK Push: ${baseUrl}/api/payments/mpesa/stk-push`);
   console.log(`   🏦  Bank transfer: ${baseUrl}/api/payments/bank-transfer`);
   console.log(`   📞  M-Pesa callback: ${baseUrl}/api/payments/mpesa/callback`);
   console.log(`   📄  Upload proof: ${baseUrl}/api/payments/upload-proof`);
   console.log(`   📊  Payment status: ${baseUrl}/api/payments/status/{orderId}/{paymentId}`);
   console.log(`   🧪  Payment test: ${baseUrl}/api/payments/test`);
   console.log(``);
 });
}

startServer().catch(err => {
 console.error("❌ Failed to start server:", err);
 process.exit(1);
});