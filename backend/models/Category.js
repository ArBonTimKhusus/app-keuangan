/**
 * Category Model
 */

const { query } = require('../config/database');

const Category = {
  /**
   * Create a new category
   */
  create: async (categoryData) => {
    const { user_id, name, type = 'expense', icon = 'tag', color = '#2196F3' } = categoryData;
    
    const result = await query(
      'INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES (?, ?, ?, ?, ?, FALSE)',
      [user_id, name, type, icon, color]
    );
    
    return await Category.findById(result.insertId);
  },

  /**
   * Find category by ID
   */
  findById: async (id) => {
    const [category] = await query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return category;
  },

  /**
   * Find all categories for a user (including defaults)
   */
  findByUserId: async (userId, type = null) => {
    let sql = 'SELECT * FROM categories WHERE (user_id = ? OR is_default = TRUE)';
    const params = [userId];
    
    if (type) {
      sql += ' AND (type = ? OR type = "both")';
      params.push(type);
    }
    
    sql += ' ORDER BY is_default DESC, name ASC';
    
    return await query(sql, params);
  },

  /**
   * Find default categories
   */
  findDefaults: async (type = null) => {
    let sql = 'SELECT * FROM categories WHERE is_default = TRUE';
    const params = [];
    
    if (type) {
      sql += ' AND (type = ? OR type = "both")';
      params.push(type);
    }
    
    sql += ' ORDER BY name ASC';
    
    return await query(sql, params);
  },

  /**
   * Update category
   */
  update: async (id, userId, updateData) => {
    const fields = [];
    const values = [];
    
    if (updateData.name) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    
    if (updateData.type) {
      fields.push('type = ?');
      values.push(updateData.type);
    }
    
    if (updateData.icon) {
      fields.push('icon = ?');
      values.push(updateData.icon);
    }
    
    if (updateData.color) {
      fields.push('color = ?');
      values.push(updateData.color);
    }
    
    if (fields.length === 0) {
      return await Category.findById(id);
    }
    
    values.push(id, userId);
    
    await query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND user_id = ? AND is_default = FALSE`,
      values
    );
    
    return await Category.findById(id);
  },

  /**
   * Delete category (only custom categories)
   */
  delete: async (id, userId) => {
    // Check if category has transactions
    const [countResult] = await query(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
      [id]
    );
    
    if (countResult.count > 0) {
      throw new Error('Tidak dapat menghapus kategori yang memiliki transaksi');
    }
    
    // Only allow deleting custom categories (not defaults)
    const result = await query(
      'DELETE FROM categories WHERE id = ? AND user_id = ? AND is_default = FALSE',
      [id, userId]
    );
    
    return result.affectedRows > 0;
  },

  /**
   * Check if category belongs to user or is default
   */
  accessibleByUser: async (categoryId, userId) => {
    const [result] = await query(
      'SELECT COUNT(*) as count FROM categories WHERE id = ? AND (user_id = ? OR is_default = TRUE)',
      [categoryId, userId]
    );
    return result.count > 0;
  }
};

module.exports = Category;
