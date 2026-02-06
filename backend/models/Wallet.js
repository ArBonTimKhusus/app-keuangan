/**
 * Wallet Model
 * Handles all wallet-related database operations
 */

const { pool } = require('../config/database');

const Wallet = {
    /**
     * Create new wallet
     */
    async create(userId, walletData) {
        const { name, icon = 'wallet', color = '#4CAF50', balance = 0, is_default = false } = walletData;
        
        // If this is the first wallet or marked as default, unset other defaults
        if (is_default) {
            await pool.query(
                'UPDATE wallets SET is_default = FALSE WHERE user_id = ?',
                [userId]
            );
        }
        
        const [result] = await pool.query(
            'INSERT INTO wallets (user_id, name, icon, color, balance, is_default) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, name, icon, color, balance, is_default]
        );
        
        return result.insertId;
    },
    
    /**
     * Find wallet by ID
     */
    async findById(id, userId) {
        const [rows] = await pool.query(
            'SELECT * FROM wallets WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        return rows[0] || null;
    },
    
    /**
     * Get all user wallets
     */
    async findAll(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM wallets WHERE user_id = ? ORDER BY is_default DESC, created_at ASC',
            [userId]
        );
        
        return rows;
    },
    
    /**
     * Get wallet with transaction count
     */
    async findByIdWithStats(id, userId) {
        const [rows] = await pool.query(`
            SELECT w.*, 
                   COUNT(t.id) as transaction_count,
                   COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
                   COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense
            FROM wallets w
            LEFT JOIN transactions t ON w.id = t.wallet_id
            WHERE w.id = ? AND w.user_id = ?
            GROUP BY w.id
        `, [id, userId]);
        
        if (rows.length === 0) return null;
        
        const wallet = rows[0];
        return {
            ...wallet,
            total_income: parseFloat(wallet.total_income) || 0,
            total_expense: parseFloat(wallet.total_expense) || 0
        };
    },
    
    /**
     * Update wallet
     */
    async update(id, userId, walletData) {
        const updates = [];
        const values = [];
        
        if (walletData.name) {
            updates.push('name = ?');
            values.push(walletData.name);
        }
        
        if (walletData.icon) {
            updates.push('icon = ?');
            values.push(walletData.icon);
        }
        
        if (walletData.color) {
            updates.push('color = ?');
            values.push(walletData.color);
        }
        
        if (walletData.balance !== undefined) {
            updates.push('balance = ?');
            values.push(walletData.balance);
        }
        
        if (walletData.is_default !== undefined) {
            // If setting as default, unset other defaults first
            if (walletData.is_default) {
                await pool.query(
                    'UPDATE wallets SET is_default = FALSE WHERE user_id = ?',
                    [userId]
                );
            }
            updates.push('is_default = ?');
            values.push(walletData.is_default);
        }
        
        if (updates.length === 0) {
            return false;
        }
        
        values.push(id, userId);
        
        const [result] = await pool.query(
            `UPDATE wallets SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Delete wallet
     */
    async delete(id, userId) {
        // Check if wallet has transactions
        const [transactions] = await pool.query(
            'SELECT COUNT(*) as count FROM transactions WHERE wallet_id = ?',
            [id]
        );
        
        if (transactions[0].count > 0) {
            throw new Error('Tidak dapat menghapus dompet yang masih memiliki transaksi');
        }
        
        const [result] = await pool.query(
            'DELETE FROM wallets WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Get total balance across all wallets
     */
    async getTotalBalance(userId) {
        const [rows] = await pool.query(
            'SELECT COALESCE(SUM(balance), 0) as total_balance FROM wallets WHERE user_id = ?',
            [userId]
        );
        
        return parseFloat(rows[0].total_balance) || 0;
    },
    
    /**
     * Get default wallet
     */
    async getDefault(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM wallets WHERE user_id = ? AND is_default = TRUE LIMIT 1',
            [userId]
        );
        
        return rows[0] || null;
    },
    
    /**
     * Update wallet balance (manual adjustment)
     */
    async updateBalance(id, userId, newBalance) {
        const [result] = await pool.query(
            'UPDATE wallets SET balance = ? WHERE id = ? AND user_id = ?',
            [newBalance, id, userId]
        );
        
        return result.affectedRows > 0;
    }
};

module.exports = Wallet;
