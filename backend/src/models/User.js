// src/models/User.js
export default class User {
  constructor(db) {
    this.db = db;
    
    if (!this.db) {
      throw new Error('Database connection is required for User model');
    }
    
    if (!this.db.query || typeof this.db.query !== 'function') {
      throw new Error('Database connection must have a query method');
    }
  }

  async createTable() {
    console.log('✅ Users table creation handled by initDB()');
  }

  async findByEmail(email) {
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      
      if (!this.db || !this.db.query) {
        throw new Error('Database connection not available');
      }
      
      const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
      const [rows] = await this.db.query(query, [email]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      if (!id) {
        throw new Error('ID is required');
      }
      
      if (!this.db || !this.db.query) {
        throw new Error('Database connection not available');
      }
      
      const query = 'SELECT * FROM users WHERE id = ? LIMIT 1';
      const [rows] = await this.db.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  async findByGoogleId(googleId) {
    try {
      if (!googleId) {
        throw new Error('Google ID is required');
      }
      
      if (!this.db || !this.db.query) {
        throw new Error('Database connection not available');
      }
      
      const query = 'SELECT * FROM users WHERE google_id = ? LIMIT 1';
      const [rows] = await this.db.query(query, [googleId]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findByGoogleId:', error);
      throw error;
    }
  }

  async create(userData) {
    try {
      if (!userData || !userData.name || !userData.email) {
        throw new Error('Name and email are required');
      }
      
      if (!this.db || !this.db.query) {
        throw new Error('Database connection not available');
      }
      
      const {
        name,
        email,
        password = null,
        google_id = null,
        picture = null,
        given_name = null,
        family_name = null,
        role = 'user',
        provider = 'email',
        email_verified = false,
        verification_token = null,
        password_setup_token = null,
        password_setup_expires = null,
        can_login_with_password = false,
        status = 'active'
      } = userData;

      const query = `
        INSERT INTO users (
          name, email, password, google_id, picture, given_name, family_name,
          role, provider, email_verified, verification_token, 
          password_setup_token, password_setup_expires, can_login_with_password,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await this.db.query(query, [
        name,
        email,
        password,
        google_id,
        picture,
        given_name,
        family_name,
        role,
        provider,
        email_verified ? 1 : 0,
        verification_token,
        password_setup_token,
        password_setup_expires,
        can_login_with_password ? 1 : 0,
        status
      ]);

      return result.insertId;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  async update(userId, updateData) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      if (!this.db || !this.db.query) {
        throw new Error('Database connection not available');
      }
      
      const fields = [];
      const values = [];
      
      // Dynamically build update query based on provided fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }
      
      // Always update the updated_at field
      fields.push('updated_at = NOW()');
      values.push(userId);const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
     
     const [result] = await this.db.query(query, values);
     return result;
   } catch (error) {
     console.error('Error in update:', error);
     throw error;
   }
 }

 async findByPasswordSetupToken(token) {
   try {
     if (!token) {
       throw new Error('Password setup token is required');
     }
     
     if (!this.db || !this.db.query) {
       throw new Error('Database connection not available');
     }
     
     const query = `
       SELECT * FROM users 
       WHERE password_setup_token = ? AND password_setup_expires > NOW()
       LIMIT 1
     `;
     const [rows] = await this.db.query(query, [token]);
     return rows[0] || null;
   } catch (error) {
     console.error('Error in findByPasswordSetupToken:', error);
     throw error;
   }
 }

 async updateLastLogin(userId) {
   try {
     if (!userId) {
       throw new Error('User ID is required');
     }
     
     return await this.update(userId, { last_login: new Date() });
   } catch (error) {
     console.error('Error in updateLastLogin:', error);
     throw error;
   }
 }

 async updateVerificationStatus(userId, isVerified = true) {
   try {
     if (!userId) {
       throw new Error('User ID is required');
     }
     
     return await this.update(userId, { 
       email_verified: isVerified ? 1 : 0, 
       verification_token: null 
     });
   } catch (error) {
     console.error('Error in updateVerificationStatus:', error);
     throw error;
   }
 }

 async setResetToken(email, token, expiresAt) {
   try {
     if (!email || !token || !expiresAt) {
       throw new Error('Email, token, and expiration are required');
     }
     
     if (!this.db || !this.db.query) {
       throw new Error('Database connection not available');
     }
     
     const query = `
       UPDATE users 
       SET reset_token = ?, reset_token_expires = ?, updated_at = NOW()
       WHERE email = ?
     `;
     
     const [result] = await this.db.query(query, [token, expiresAt, email]);
     return result;
   } catch (error) {
     console.error('Error in setResetToken:', error);
     throw error;
   }
 }

 async findByResetToken(token) {
   try {
     if (!token) {
       throw new Error('Reset token is required');
     }
     
     if (!this.db || !this.db.query) {
       throw new Error('Database connection not available');
     }
     
     const query = `
       SELECT * FROM users 
       WHERE reset_token = ? AND reset_token_expires > NOW()
       LIMIT 1
     `;
     const [rows] = await this.db.query(query, [token]);
     return rows[0] || null;
   } catch (error) {
     console.error('Error in findByResetToken:', error);
     throw error;
   }
 }

 async updatePassword(userId, hashedPassword) {
   try {
     if (!userId || !hashedPassword) {
       throw new Error('User ID and hashed password are required');
     }
     
     return await this.update(userId, {
       password: hashedPassword,
       reset_token: null,
       reset_token_expires: null,
       can_login_with_password: 1
     });
   } catch (error) {
     console.error('Error in updatePassword:', error);
     throw error;
   }
 }

 async setPasswordSetupToken(userId, token, expiresAt) {
   try {
     if (!userId || !token || !expiresAt) {
       throw new Error('User ID, token, and expiration are required');
     }
     
     return await this.update(userId, {
       password_setup_token: token,
       password_setup_expires: expiresAt
     });
   } catch (error) {
     console.error('Error in setPasswordSetupToken:', error);
     throw error;
   }
 }

 async clearPasswordSetupToken(userId) {
   try {
     if (!userId) {
       throw new Error('User ID is required');
     }
     
     return await this.update(userId, {
       password_setup_token: null,
       password_setup_expires: null
     });
   } catch (error) {
     console.error('Error in clearPasswordSetupToken:', error);
     throw error;
   }
 }

 async getAllUsers() {
   try {
     if (!this.db || !this.db.query) {
       throw new Error('Database connection not available');
     }
     
     const query = `
       SELECT id, name, email, role, provider, email_verified, 
              can_login_with_password, status, last_login, created_at 
       FROM users 
       ORDER BY created_at DESC
     `;
     const [rows] = await this.db.query(query);
     return rows;
   } catch (error) {
     console.error('Error in getAllUsers:', error);
     throw error;
   }
 }

 async deleteUser(userId) {
   try {
     if (!userId) {
       throw new Error('User ID is required');
     }
     
     if (!this.db || !this.db.query) {
       throw new Error('Database connection not available');
     }
     
     const query = 'DELETE FROM users WHERE id = ?';
     const [result] = await this.db.query(query, [userId]);
     return result;
   } catch (error) {
     console.error('Error in deleteUser:', error);
     throw error;
   }
 }

 async updateRole(userId, role) {
   try {
     if (!userId || !role) {
       throw new Error('User ID and role are required');
     }
     
     return await this.update(userId, { role });
   } catch (error) {
     console.error('Error in updateRole:', error);
     throw error;
   }
 }

 async count() {
   try {
     if (!this.db || !this.db.query) {
       throw new Error('Database connection not available');
     }
     
     const query = 'SELECT COUNT(*) as count FROM users';
     const [rows] = await this.db.query(query);
     return rows[0]?.count || 0;
   } catch (error) {
     console.error('Error in count:', error);
     throw error;
   }
 }

 // Get user statistics
 async getStats() {
   try {
     if (!this.db || !this.db.query) {
       throw new Error('Database connection not available');
     }
     
     const queries = {
       total: 'SELECT COUNT(*) as count FROM users',
       verified: 'SELECT COUNT(*) as count FROM users WHERE email_verified = 1',
       google_users: 'SELECT COUNT(*) as count FROM users WHERE google_id IS NOT NULL',
       password_users: 'SELECT COUNT(*) as count FROM users WHERE can_login_with_password = 1',
       admins: 'SELECT COUNT(*) as count FROM users WHERE role = "admin"',
       recent: `SELECT COUNT(*) as count FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)`
     };

     const results = {};
     for (const [key, query] of Object.entries(queries)) {
       const [rows] = await this.db.query(query);
       results[key] = rows[0]?.count || 0;
     }

     return results;
   } catch (error) {
     console.error('Error in getStats:', error);
     throw error;
   }
 }

 // Sequelize-compatible methods for compatibility with existing code
 static sequelize = {
   Op: {
     gt: 'gt'
   },
   transaction: async () => {
     // Simple transaction simulation - in production, use proper transactions
     return {
       commit: async () => console.log('Transaction committed'),
       rollback: async () => console.log('Transaction rolled back')
     };
   }
 };

 static async findOne(options) {
   // This is a compatibility method for the existing controller code
   const db = global.db || this.db;
   if (!db) throw new Error('Database connection not available');
   
   const userModel = new User(db);
   
   if (options.where?.email) {
     return await userModel.findByEmail(options.where.email);
   }
   if (options.where?.google_id) {
     return await userModel.findByGoogleId(options.where.google_id);
   }
   if (options.where?.password_setup_token) {
     return await userModel.findByPasswordSetupToken(options.where.password_setup_token);
   }
   if (options.where?.reset_token) {
     return await userModel.findByResetToken(options.where.reset_token);
   }
   
   throw new Error('Unsupported findOne query');
 }

 static async create(userData, options = {}) {
   // Compatibility method for existing controller code
   const db = global.db || this.db;
   if (!db) throw new Error('Database connection not available');
   
   const userModel = new User(db);
   const userId = await userModel.create(userData);
   
   // Return user-like object with basic properties and update method
   return {
     id: userId,
     ...userData,
     update: async (updateData) => {
       return await userModel.update(userId, updateData);
     }
   };
 }

 static async count() {
   // Compatibility method for existing controller code
   const db = global.db || this.db;
   if (!db) throw new Error('Database connection not available');
   
   const userModel = new User(db);
   return await userModel.count();
 }

 static async findAll(options = {}) {
   // Compatibility method for existing controller code
   const db = global.db || this.db;
   if (!db) throw new Error('Database connection not available');
   
   const userModel = new User(db);
   return await userModel.getAllUsers();
 }

 static async findByPk(id, options = {}) {
   // Compatibility method for existing controller code
   const db = global.db || this.db;
   if (!db) throw new Error('Database connection not available');
   
   const userModel = new User(db);
   return await userModel.findById(id);
 }
}

// Set global db reference for static methods
User.setDbConnection = (dbConnection) => {
 global.db = dbConnection;
};