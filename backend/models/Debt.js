/**
 * Debt Model
 */

const { query } = require('../config/database');
const { getPagination, isOverdue } = require('../utils/helpers');

const Debt = {
  /**
   * Create a new debt
   */
  create: async (debtData) => {
    const {
      user_id,
      type,
      person_name,
      amount,
      remaining_amount = null,
      description,
      date,
      due_date = null,
      status = 'active',
      notes = null
    } = debtData;
    
    const result = await query(
      'INSERT INTO debts (user_id, type, person_name, amount, remaining_amount, description, date, due_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, type, person_name, amount, remaining_amount || amount, description, date, due_date, status, notes]
    );
    
    return await Debt.findById(result.insertId);
  },

  /**
   * Find debt by ID
   */
  findById: async (id) => {
    const [debt] = await query(
      'SELECT * FROM debts WHERE id = ?',
      [id]
    );
    return debt;
  },

  /**
   * Find all debts for a user with filters and pagination
   */
  findByUserId: async (userId, filters = {}, page = 1, limit = 20) => {
    const { offset, limit: limitValue } = getPagination(page, limit);
    
    let sql = 'SELECT * FROM debts WHERE user_id = ?';
    const params = [userId];
    
    // Apply filters
    if (filters.type) {
      sql += ' AND type = ?';
      params.push(filters.type);
    }
    
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.search) {
      sql += ' AND (person_name LIKE ? OR description LIKE ? OR notes LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sql += ' ORDER BY date DESC, created_at DESC';
    sql += ' LIMIT ? OFFSET ?';
    params.push(limitValue, offset);
    
    const debts = await query(sql, params);
    
    // Update overdue status
    for (const debt of debts) {
      if (debt.status === 'active' && debt.due_date && isOverdue(debt.due_date)) {
        await Debt.updateStatus(debt.id, 'overdue');
        debt.status = 'overdue';
      }
    }
    
    return debts;
  },

  /**
   * Count debts for a user with filters
   */
  countByUserId: async (userId, filters = {}) => {
    let sql = 'SELECT COUNT(*) as count FROM debts WHERE user_id = ?';
    const params = [userId];
    
    if (filters.type) {
      sql += ' AND type = ?';
      params.push(filters.type);
    }
    
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.search) {
      sql += ' AND (person_name LIKE ? OR description LIKE ? OR notes LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    const [result] = await query(sql, params);
    return result.count;
  },

  /**
   * Update debt
   */
  update: async (id, userId, updateData) => {
    const fields = [];
    const values = [];
    
    if (updateData.type) {
      fields.push('type = ?');
      values.push(updateData.type);
    }
    
    if (updateData.person_name) {
      fields.push('person_name = ?');
      values.push(updateData.person_name);
    }
    
    if (updateData.amount !== undefined) {
      fields.push('amount = ?');
      values.push(updateData.amount);
    }
    
    if (updateData.remaining_amount !== undefined) {
      fields.push('remaining_amount = ?');
      values.push(updateData.remaining_amount);
    }
    
    if (updateData.description) {
      fields.push('description = ?');
      values.push(updateData.description);
    }
    
    if (updateData.date) {
      fields.push('date = ?');
      values.push(updateData.date);
    }
    
    if (updateData.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(updateData.due_date);
    }
    
    if (updateData.status) {
      fields.push('status = ?');
      values.push(updateData.status);
    }
    
    if (updateData.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updateData.notes);
    }
    
    if (fields.length === 0) {
      return await Debt.findById(id);
    }
    
    values.push(id, userId);
    
    await query(
      `UPDATE debts SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    
    return await Debt.findById(id);
  },

  /**
   * Update debt status
   */
  updateStatus: async (id, status) => {
    await query(
      'UPDATE debts SET status = ? WHERE id = ?',
      [status, id]
    );
  },

  /**
   * Mark debt as paid
   */
  markAsPaid: async (id, userId) => {
    await query(
      'UPDATE debts SET status = "paid", remaining_amount = 0 WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    return await Debt.findById(id);
  },

  /**
   * Delete debt
   */
  delete: async (id, userId) => {
    const result = await query(
      'DELETE FROM debts WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    return result.affectedRows > 0;
  },

  /**
   * Check if debt belongs to user
   */
  belongsToUser: async (debtId, userId) => {
    const [result] = await query(
      'SELECT COUNT(*) as count FROM debts WHERE id = ? AND user_id = ?',
      [debtId, userId]
    );
    return result.count > 0;
  },

  /**
   * Get debt summary for a user
   */
  getSummary: async (userId) => {
    const [summary] = await query(
      `SELECT 
        SUM(CASE WHEN type = 'hutang' AND status != 'paid' THEN remaining_amount ELSE 0 END) as total_hutang,
        SUM(CASE WHEN type = 'piutang' AND status != 'paid' THEN remaining_amount ELSE 0 END) as total_piutang,
        COUNT(CASE WHEN type = 'hutang' AND status = 'active' THEN 1 END) as active_hutang_count,
        COUNT(CASE WHEN type = 'piutang' AND status = 'active' THEN 1 END) as active_piutang_count
       FROM debts 
       WHERE user_id = ?`,
      [userId]
    );
    
    return {
      total_hutang: parseFloat(summary.total_hutang) || 0,
      total_piutang: parseFloat(summary.total_piutang) || 0,
      active_hutang_count: parseInt(summary.active_hutang_count) || 0,
      active_piutang_count: parseInt(summary.active_piutang_count) || 0
    };
  }
};

module.exports = Debt;
