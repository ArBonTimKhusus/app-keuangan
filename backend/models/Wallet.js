/**
 * Wallet Model
 */

const { query } = require('../config/database');

const Wallet = {
  /**
   * Create a new wallet
   */
  create: async (walletData) => {
    const { user_id, name, icon = 'wallet', balance = 0, color = '#4CAF50', is_default = false } = walletData;
    
    // If this is set as default, unset other defaults for this user
    if (is_default) {
      await query(
        'UPDATE wallets SET is_default = FALSE WHERE user_id = ?',
        [user_id]
      );
    }
    
    const result = await query(
      'INSERT INTO wallets (user_id, name, icon, balance, color, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, name, icon, balance, color, is_default]
    );
    
    return await Wallet.findById(result.insertId);
  },

  /**
   * Find wallet by ID
   */
  findById: async (id) => {
    const [wallet] = await query(
      'SELECT * FROM wallets WHERE id = ?',
      [id]
    );
    return wallet;
  },

  /**
   * Find all wallets for a user
   */
  findByUserId: async (userId) => {
    return await query(
      'SELECT * FROM wallets WHERE user_id = ? ORDER BY is_default DESC, created_at ASC',
      [userId]
    );
  },

  /**
   * Update wallet
   */
  update: async (id, userId, updateData) => {
    const fields = [];
    const values = [];
    
    if (updateData.name) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    
    if (updateData.icon) {
      fields.push('icon = ?');
      values.push(updateData.icon);
    }
    
    if (updateData.color) {
      fields.push('color = ?');
      values.push(updateData.color);
    }
    
    if (updateData.is_default !== undefined) {
      if (updateData.is_default) {
        // Unset other defaults for this user
        await query(
          'UPDATE wallets SET is_default = FALSE WHERE user_id = ?',
          [userId]
        );
      }
      fields.push('is_default = ?');
      values.push(updateData.is_default);
    }
    
    if (fields.length === 0) {
      return await Wallet.findById(id);
    }
    
    values.push(id, userId);
    
    await query(
      `UPDATE wallets SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    
    return await Wallet.findById(id);
  },

  /**
   * Delete wallet
   */
  delete: async (id, userId) => {
    // Check if wallet has transactions
    const [countResult] = await query(
      'SELECT COUNT(*) as count FROM transactions WHERE wallet_id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (countResult.count > 0) {
      throw new Error('Tidak dapat menghapus dompet yang memiliki transaksi');
    }
    
    const result = await query(
      'DELETE FROM wallets WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    return result.affectedRows > 0;
  },

  /**
   * Get wallet balance
   */
  getBalance: async (id) => {
    const [wallet] = await query(
      'SELECT balance FROM wallets WHERE id = ?',
      [id]
    );
    return wallet ? wallet.balance : null;
  },

  /**
   * Check if wallet belongs to user
   */
  belongsToUser: async (walletId, userId) => {
    const [result] = await query(
      'SELECT COUNT(*) as count FROM wallets WHERE id = ? AND user_id = ?',
      [walletId, userId]
    );
    return result.count > 0;
  }
};

module.exports = Wallet;
