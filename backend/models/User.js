/**
 * User Model
 * Handles all user-related database operations
 */

const { pool } = require('../config/database');
const { hashPassword, sanitizeUser } = require('../utils/helpers');

const User = {
    /**
     * Create new user
     */
    async create(userData) {
        const { name, email, password, role = 'user' } = userData;
        
        const hashedPassword = await hashPassword(password);
        
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );
        
        return result.insertId;
    },
    
    /**
     * Find user by ID
     */
    async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        
        return rows[0] || null;
    },
    
    /**
     * Find user by email
     */
    async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        return rows[0] || null;
    },
    
    /**
     * Update user
     */
    async update(id, userData) {
        const updates = [];
        const values = [];
        
        if (userData.name) {
            updates.push('name = ?');
            values.push(userData.name);
        }
        
        if (userData.email) {
            updates.push('email = ?');
            values.push(userData.email);
        }
        
        if (userData.password) {
            updates.push('password = ?');
            values.push(await hashPassword(userData.password));
        }
        
        if (userData.avatar_url !== undefined) {
            updates.push('avatar_url = ?');
            values.push(userData.avatar_url);
        }
        
        if (updates.length === 0) {
            return false;
        }
        
        values.push(id);
        
        const [result] = await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Update last login timestamp
     */
    async updateLastLogin(id) {
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [id]
        );
    },
    
    /**
     * Deactivate user
     */
    async deactivate(id) {
        const [result] = await pool.query(
            'UPDATE users SET is_active = FALSE WHERE id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Activate user
     */
    async activate(id) {
        const [result] = await pool.query(
            'UPDATE users SET is_active = TRUE WHERE id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Check if email exists
     */
    async emailExists(email, excludeId = null) {
        let query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
        const params = [email];
        
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [rows] = await pool.query(query, params);
        return rows[0].count > 0;
    },
    
    /**
     * Get user statistics
     */
    async getStats(userId) {
        const [rows] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM transactions WHERE user_id = ?) as total_transactions,
                (SELECT COUNT(*) FROM wallets WHERE user_id = ?) as total_wallets,
                (SELECT COUNT(*) FROM categories WHERE user_id = ?) as total_categories,
                (SELECT COUNT(*) FROM debts WHERE user_id = ?) as total_debts
        `, [userId, userId, userId, userId]);
        
        return rows[0];
    }
};

module.exports = User;
