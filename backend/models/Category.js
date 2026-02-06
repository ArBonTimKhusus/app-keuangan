/**
 * Category Model
 * Handles all category-related database operations
 */

const { pool } = require('../config/database');

const Category = {
    /**
     * Create new category
     */
    async create(userId, categoryData) {
        const { name, type, icon = 'circle', color = '#9E9E9E' } = categoryData;
        
        const [result] = await pool.query(
            'INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES (?, ?, ?, ?, ?, FALSE)',
            [userId, name, type, icon, color]
        );
        
        return result.insertId;
    },
    
    /**
     * Find category by ID
     */
    async findById(id, userId) {
        const [rows] = await pool.query(
            'SELECT * FROM categories WHERE id = ? AND (user_id = ? OR is_default = TRUE)',
            [id, userId]
        );
        
        return rows[0] || null;
    },
    
    /**
     * Get all categories (defaults + user custom)
     */
    async findAll(userId, type = null) {
        let query = 'SELECT * FROM categories WHERE (user_id = ? OR is_default = TRUE)';
        const params = [userId];
        
        if (type) {
            query += ' AND (type = ? OR type = "both")';
            params.push(type);
        }
        
        query += ' ORDER BY is_default DESC, name ASC';
        
        const [rows] = await pool.query(query, params);
        
        return rows;
    },
    
    /**
     * Update category
     */
    async update(id, userId, categoryData) {
        // Can only update user's own categories (not defaults)
        const category = await this.findById(id, userId);
        
        if (!category) {
            throw new Error('Kategori tidak ditemukan');
        }
        
        if (category.is_default) {
            throw new Error('Tidak dapat mengubah kategori default');
        }
        
        if (category.user_id !== userId) {
            throw new Error('Tidak dapat mengubah kategori orang lain');
        }
        
        const updates = [];
        const values = [];
        
        if (categoryData.name) {
            updates.push('name = ?');
            values.push(categoryData.name);
        }
        
        if (categoryData.type) {
            updates.push('type = ?');
            values.push(categoryData.type);
        }
        
        if (categoryData.icon) {
            updates.push('icon = ?');
            values.push(categoryData.icon);
        }
        
        if (categoryData.color) {
            updates.push('color = ?');
            values.push(categoryData.color);
        }
        
        if (updates.length === 0) {
            return false;
        }
        
        values.push(id, userId);
        
        const [result] = await pool.query(
            `UPDATE categories SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Delete category
     */
    async delete(id, userId) {
        // Can only delete user's own categories (not defaults)
        const category = await this.findById(id, userId);
        
        if (!category) {
            throw new Error('Kategori tidak ditemukan');
        }
        
        if (category.is_default) {
            throw new Error('Tidak dapat menghapus kategori default');
        }
        
        if (category.user_id !== userId) {
            throw new Error('Tidak dapat menghapus kategori orang lain');
        }
        
        // Check if category has transactions
        const [transactions] = await pool.query(
            'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
            [id]
        );
        
        if (transactions[0].count > 0) {
            throw new Error('Tidak dapat menghapus kategori yang masih memiliki transaksi');
        }
        
        const [result] = await pool.query(
            'DELETE FROM categories WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Get category usage statistics
     */
    async getUsageStats(id, userId) {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(t.id) as transaction_count,
                COALESCE(SUM(t.amount), 0) as total_amount
            FROM categories c
            LEFT JOIN transactions t ON c.id = t.category_id
            WHERE c.id = ? AND (c.user_id = ? OR c.is_default = TRUE)
            GROUP BY c.id
        `, [id, userId]);
        
        if (rows.length === 0) return null;
        
        return {
            transaction_count: rows[0].transaction_count,
            total_amount: parseFloat(rows[0].total_amount) || 0
        };
    }
};

module.exports = Category;
