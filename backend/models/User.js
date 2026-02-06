/**
 * User Model
 */

const { query, transaction } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  /**
   * Create a new user
   */
  create: async (userData) => {
    const { name, email, password, role = 'user' } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    return {
      id: result.insertId,
      name,
      email,
      role
    };
  },

  /**
   * Find user by ID
   */
  findById: async (id) => {
    const [user] = await query(
      'SELECT id, name, email, avatar_url, role, is_active, last_login, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return user;
  },

  /**
   * Find user by email
   */
  findByEmail: async (email) => {
    const [user] = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return user;
  },

  /**
   * Verify password
   */
  verifyPassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  /**
   * Update user profile
   */
  update: async (id, updateData) => {
    const fields = [];
    const values = [];
    
    if (updateData.name) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    
    if (updateData.email) {
      fields.push('email = ?');
      values.push(updateData.email);
    }
    
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
      fields.push('password = ?');
      values.push(hashedPassword);
    }
    
    if (updateData.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      values.push(updateData.avatar_url);
    }
    
    if (fields.length === 0) {
      return null;
    }
    
    values.push(id);
    
    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return await User.findById(id);
  },

  /**
   * Update last login
   */
  updateLastLogin: async (id) => {
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [id]
    );
  },

  /**
   * Delete user (soft delete by setting is_active to false)
   */
  delete: async (id) => {
    await query(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [id]
    );
  },

  /**
   * Check if email exists
   */
  emailExists: async (email, excludeId = null) => {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    const params = [email];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [result] = await query(sql, params);
    return result.count > 0;
  }
};

module.exports = User;
