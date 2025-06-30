import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment-specific config file
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

export let db;

export async function initDB() {
  try {
    console.log('🔧 Initializing database...');
    
    // 1 ▸ root connection (no DB yet)
    const root = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
    });

    // 2 ▸ create database if needed
    await root.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await root.query(`USE \`${DB_NAME}\``);
    console.log(`✅ Database ${DB_NAME} created/verified`);

    // 3 ▸ ensure tables

    // employees
    await root.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        full_name     VARCHAR(100) NOT NULL,
        id_number     VARCHAR(20)  NOT NULL UNIQUE,
        phone         VARCHAR(20)  NOT NULL,
        email         VARCHAR(100) NOT NULL UNIQUE,
        code          CHAR(6)      NOT NULL,
        password_hash CHAR(60)     NOT NULL,
        role          ENUM('pending','admin','manager','cashier','employee')
                      NOT NULL DEFAULT 'pending',
        suspended     TINYINT(1) NOT NULL DEFAULT 0,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // items
    await root.query(`
      CREATE TABLE IF NOT EXISTS items (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        category        VARCHAR(60)  NOT NULL,
        name            VARCHAR(120) NOT NULL,
        description     TEXT,
        detail          TEXT,
        price           DECIMAL(10,2) NOT NULL,
        discount        TINYINT(1) NOT NULL DEFAULT 0,
        discount_amount DECIMAL(10,2),
        discount_reason VARCHAR(255),
        suspended       TINYINT(1) NOT NULL DEFAULT 0,
        stock_update    TINYINT(1) NOT NULL DEFAULT 1,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        share_link      VARCHAR(255),
        INDEX idx_cat_name (category, name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // item_images
    await root.query(`
      CREATE TABLE IF NOT EXISTS item_images (
        id        INT AUTO_INCREMENT PRIMARY KEY,
        item_id   INT NOT NULL,
        file_name VARCHAR(100) NOT NULL,
        INDEX idx_item (item_id),
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // users
    await root.query(`
      CREATE TABLE IF NOT EXISTS users (
        id                      INT AUTO_INCREMENT PRIMARY KEY,
        name                    VARCHAR(100) NOT NULL,
        email                   VARCHAR(100) NOT NULL UNIQUE,
        password                VARCHAR(255),
        google_id               VARCHAR(100),
        picture                 VARCHAR(500),
        given_name              VARCHAR(100),
        family_name             VARCHAR(100),
        role                    ENUM('user', 'admin', 'manager') DEFAULT 'user',
        provider                ENUM('email', 'google') DEFAULT 'email',
        email_verified          TINYINT(1) DEFAULT 0,
        verification_token      VARCHAR(255),
        reset_token             VARCHAR(255),
        reset_token_expires     TIMESTAMP NULL,
        password_setup_token    VARCHAR(255),
        password_setup_expires  TIMESTAMP NULL,
        can_login_with_password TINYINT(1) DEFAULT 0,
        status                  VARCHAR(50) DEFAULT 'active',
        last_login              TIMESTAMP NULL,
        created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_google_id (google_id),
        INDEX idx_verification_token (verification_token),
        INDEX idx_reset_token (reset_token),
        INDEX idx_password_setup_token (password_setup_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ✅ CRITICAL: temp_orders table (MUST be created BEFORE orders table due to foreign key in orders)
    await root.query(`
      CREATE TABLE IF NOT EXISTS temp_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        temp_ref VARCHAR(100) UNIQUE NOT NULL,
        customer_data JSON NOT NULL,
        delivery_data JSON NOT NULL,
        payment_data JSON NOT NULL,
        items_data JSON NOT NULL,
        notes TEXT,
        calculated_total DECIMAL(10,2) NOT NULL,
        payment_required DECIMAL(10,2) NOT NULL,
        status ENUM('pending_payment', 'payment_initiated', 'awaiting_bank_transfer', 'completed', 'expired') DEFAULT 'pending_payment',
        checkout_request_id VARCHAR(255),
        bank_transfer_ref VARCHAR(255),
        final_order_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        INDEX idx_temp_ref (temp_ref),
        INDEX idx_checkout_request (checkout_request_id),
        INDEX idx_status (status),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Enhanced orders table with all required fields
    await root.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        temp_order_ref VARCHAR(100),                    -- ✅ Add reference to temp_orders
        user_id INT,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20) NOT NULL,
        delivery_method ENUM('delivery', 'pickup') NOT NULL,
        delivery_address TEXT,
        delivery_location_lat DECIMAL(10, 8),
        delivery_location_lng DECIMAL(11, 8),
        delivery_distance DECIMAL(8,2) DEFAULT 0,
        delivery_cost DECIMAL(10, 2) DEFAULT 0,
        subtotal DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        deposit_amount DECIMAL(10, 2) NOT NULL,
        total_deposit_due DECIMAL(10, 2) NOT NULL,
        balance_amount DECIMAL(10, 2) NOT NULL,
        order_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('pending', 'partial', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        payment_method ENUM('mpesa', 'bank_transfer', 'cash') NOT NULL,
        notes TEXT,
        admin_notes TEXT,
        google_user BOOLEAN DEFAULT FALSE,
        registration_status VARCHAR(50),
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (temp_order_ref) REFERENCES temp_orders(temp_ref) ON DELETE SET NULL,  -- ✅ Add foreign key
        INDEX idx_order_number (order_number),
        INDEX idx_temp_order_ref (temp_order_ref),      -- ✅ Add index
        INDEX idx_user_id (user_id),
        INDEX idx_order_status (order_status),
        INDEX idx_payment_status (payment_status),
        INDEX idx_customer_email (customer_email),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Enhanced order_items table
    await root.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        item_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        item_description TEXT,
        item_price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT,
        INDEX idx_order_id (order_id),
        INDEX idx_item_id (item_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Separate delivery_locations table for detailed location data
    await root.query(`
      CREATE TABLE IF NOT EXISTS delivery_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        address TEXT NOT NULL,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        place_id VARCHAR(255),
        location_types JSON,
        location_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ✅ UPDATED: Enhanced mpesa_transactions table with temp_order_ref support
    await root.query(`
      CREATE TABLE IF NOT EXISTS mpesa_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,                                   -- Keep for backward compatibility
        temp_order_ref VARCHAR(100),                   -- ✅ Add support for temp orders
        merchant_request_id VARCHAR(255),
        checkout_request_id VARCHAR(255),
        response_code VARCHAR(10),
        response_description TEXT,
        customer_message TEXT,
        phone_number VARCHAR(20) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        account_reference VARCHAR(255),
        transaction_desc TEXT,
        transaction_type ENUM('CustomerPayBillOnline', 'CustomerBuyGoodsOnline') DEFAULT 'CustomerPayBillOnline',
        stk_push_sent BOOLEAN DEFAULT FALSE,
        stk_push_response JSON,
        callback_received BOOLEAN DEFAULT FALSE,
        callback_data JSON,
        status ENUM('initiated', 'pending', 'success', 'failed', 'cancelled', 'timeout') DEFAULT 'initiated',
        result_code VARCHAR(10),
        result_desc TEXT,
        mpesa_receipt_number VARCHAR(255),
        transaction_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
        FOREIGN KEY (temp_order_ref) REFERENCES temp_orders(temp_ref) ON DELETE SET NULL,  -- ✅ Add foreign key
        UNIQUE KEY unique_checkout_request (checkout_request_id),
        INDEX idx_order_id (order_id),
        INDEX idx_temp_order_ref (temp_order_ref),      -- ✅ Add index for temp orders
        INDEX idx_checkout_request_id (checkout_request_id),
        INDEX idx_mpesa_receipt_number (mpesa_receipt_number),
        INDEX idx_phone_number (phone_number),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ✅ UPDATED: Enhanced bank_transfers table with temp_order_ref support
    await root.query(`
      CREATE TABLE IF NOT EXISTS bank_transfers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,                                   -- Make nullable for temp orders
        temp_order_ref VARCHAR(100),                   -- ✅ Add support for temp orders
        reference_number VARCHAR(255) UNIQUE NOT NULL,
        bank_name VARCHAR(255),
        account_number VARCHAR(255),
        account_name VARCHAR(255),
        amount DECIMAL(10, 2) NOT NULL,
        transfer_date DATE,
        proof_of_payment VARCHAR(255),
        verified BOOLEAN DEFAULT FALSE,
        verified_by INT,
        verified_at TIMESTAMP NULL,
        verification_notes TEXT,
        status ENUM('pending', 'submitted', 'verified', 'rejected') DEFAULT 'pending',
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (temp_order_ref) REFERENCES temp_orders(temp_ref) ON DELETE CASCADE,  -- ✅ Add foreign key
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_order_id (order_id),
        INDEX idx_temp_order_ref (temp_order_ref),      -- ✅ Add index for temp orders
        INDEX idx_reference_number (reference_number),
        INDEX idx_status (status),
        INDEX idx_verified (verified)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Enhanced payment_receipts table
    await root.query(`
      CREATE TABLE IF NOT EXISTS payment_receipts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        receipt_number VARCHAR(255) UNIQUE NOT NULL,
        order_id INT NOT NULL,
        payment_type ENUM('mpesa', 'bank_transfer', 'cash') NOT NULL,
        transaction_id INT,
        amount DECIMAL(10, 2) NOT NULL,
        payment_date TIMESTAMP NOT NULL,
        receipt_data JSON,
        email_sent BOOLEAN DEFAULT FALSE,
        email_sent_at TIMESTAMP NULL,
        email_attempts INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_receipt_number (receipt_number),
        INDEX idx_payment_type (payment_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ All database tables created successfully');
    await root.end();

    // 4 ▸ pooled connection for app
    db = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });

    console.log('✅ Database pool created successfully');
    
    // Test the connection
    const testConnection = await db.getConnection();
    await testConnection.query('SELECT 1');
    testConnection.release();
    console.log('✅ Database connection test successful');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Helper function to check database health
export async function checkDatabaseHealth() {
  try {
    const [result] = await db.query('SELECT 1 as health');
    return { healthy: true, result: result[0] };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}

// Helper function to get table information
export async function getTableInfo() {
  try {
    const [tables] = await db.query('SHOW TABLES');
    const tableInfo = {};
    
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      try {
        const [count] = await db.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        tableInfo[tableName] = { exists: true, count: count[0].count };
      } catch (error) {
        tableInfo[tableName] = { exists: false, error: error.message };
      }
    }
    
    return tableInfo;
  } catch (error) {
    throw error;
  }
}

// ✅ UPDATED: Helper function to verify all payment tables exist (including temp_orders)
export async function verifyPaymentTables() {
  try {
    const requiredTables = [
      'temp_orders',           // ✅ Add temp_orders to verification
      'orders',
      'order_items', 
      'delivery_locations',
      'mpesa_transactions',
      'bank_transfers',
      'payment_receipts'
    ];
    
    const results = {};
    
    for (const table of requiredTables) {
      try {
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        results[table] = { exists: true, count: rows[0].count };
      } catch (error) {
        results[table] = { exists: false, error: error.message };
      }
    }
    
    return results;
  } catch (error) {
    throw error;
  }
}

// ✅ NEW: Helper function to clean up expired temp orders
export async function cleanupExpiredTempOrders() {
  try {
    const [result] = await db.query(
      'DELETE FROM temp_orders WHERE expires_at < NOW() AND status NOT IN ("completed")'
    );
    
    if (result.affectedRows > 0) {
      console.log(`🧹 Cleaned up ${result.affectedRows} expired temporary orders`);
    }
    
    return { cleaned: result.affectedRows };
  } catch (error) {
    console.error('❌ Failed to cleanup expired temp orders:', error);
    return { cleaned: 0, error: error.message };
  }
}