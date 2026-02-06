/**
 * Transaction Model
 */

const { query } = require('../config/database');
const { getPagination } = require('../utils/helpers');

const Transaction = {
  /**
   * Create a new transaction
   */
  create: async (transactionData) => {
    const { 
      user_id, 
      wallet_id, 
      category_id, 
      type, 
      amount, 
      description, 
      date, 
      notes = null 
    } = transactionData;
    
    const result = await query(
      'INSERT INTO transactions (user_id, wallet_id, category_id, type, amount, description, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, wallet_id, category_id, type, amount, description, date, notes]
    );
    
    return await Transaction.findById(result.insertId);
  },

  /**
   * Find transaction by ID
   */
  findById: async (id) => {
    const [transaction] = await query(
      `SELECT t.*, 
              w.name as wallet_name, 
              c.name as category_name, 
              c.icon as category_icon, 
              c.color as category_color
       FROM transactions t
       LEFT JOIN wallets w ON t.wallet_id = w.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [id]
    );
    return transaction;
  },

  /**
   * Find all transactions for a user with filters and pagination
   */
  findByUserId: async (userId, filters = {}, page = 1, limit = 20) => {
    const { offset, limit: limitValue } = getPagination(page, limit);
    
    let sql = `
      SELECT t.*, 
             w.name as wallet_name, 
             c.name as category_name, 
             c.icon as category_icon, 
             c.color as category_color
      FROM transactions t
      LEFT JOIN wallets w ON t.wallet_id = w.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    const params = [userId];
    
    // Apply filters
    if (filters.type) {
      sql += ' AND t.type = ?';
      params.push(filters.type);
    }
    
    if (filters.wallet_id) {
      sql += ' AND t.wallet_id = ?';
      params.push(filters.wallet_id);
    }
    
    if (filters.category_id) {
      sql += ' AND t.category_id = ?';
      params.push(filters.category_id);
    }
    
    if (filters.start_date) {
      sql += ' AND t.date >= ?';
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      sql += ' AND t.date <= ?';
      params.push(filters.end_date);
    }
    
    if (filters.search) {
      sql += ' AND (t.description LIKE ? OR t.notes LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    sql += ' ORDER BY t.date DESC, t.created_at DESC';
    sql += ' LIMIT ? OFFSET ?';
    params.push(limitValue, offset);
    
    return await query(sql, params);
  },

  /**
   * Count transactions for a user with filters
   */
  countByUserId: async (userId, filters = {}) => {
    let sql = 'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?';
    const params = [userId];
    
    if (filters.type) {
      sql += ' AND type = ?';
      params.push(filters.type);
    }
    
    if (filters.wallet_id) {
      sql += ' AND wallet_id = ?';
      params.push(filters.wallet_id);
    }
    
    if (filters.category_id) {
      sql += ' AND category_id = ?';
      params.push(filters.category_id);
    }
    
    if (filters.start_date) {
      sql += ' AND date >= ?';
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      sql += ' AND date <= ?';
      params.push(filters.end_date);
    }
    
    if (filters.search) {
      sql += ' AND (description LIKE ? OR notes LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    const [result] = await query(sql, params);
    return result.count;
  },

  /**
   * Update transaction
   */
  update: async (id, userId, updateData) => {
    const fields = [];
    const values = [];
    
    if (updateData.wallet_id) {
      fields.push('wallet_id = ?');
      values.push(updateData.wallet_id);
    }
    
    if (updateData.category_id) {
      fields.push('category_id = ?');
      values.push(updateData.category_id);
    }
    
    if (updateData.type) {
      fields.push('type = ?');
      values.push(updateData.type);
    }
    
    if (updateData.amount !== undefined) {
      fields.push('amount = ?');
      values.push(updateData.amount);
    }
    
    if (updateData.description) {
      fields.push('description = ?');
      values.push(updateData.description);
    }
    
    if (updateData.date) {
      fields.push('date = ?');
      values.push(updateData.date);
    }
    
    if (updateData.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updateData.notes);
    }
    
    if (fields.length === 0) {
      return await Transaction.findById(id);
    }
    
    values.push(id, userId);
    
    await query(
      `UPDATE transactions SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    
    return await Transaction.findById(id);
  },

  /**
   * Delete transaction
   */
  delete: async (id, userId) => {
    const result = await query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    return result.affectedRows > 0;
  },

  /**
   * Check if transaction belongs to user
   */
  belongsToUser: async (transactionId, userId) => {
    const [result] = await query(
      'SELECT COUNT(*) as count FROM transactions WHERE id = ? AND user_id = ?',
      [transactionId, userId]
    );
    return result.count > 0;
  }
};

module.exports = Transaction;
