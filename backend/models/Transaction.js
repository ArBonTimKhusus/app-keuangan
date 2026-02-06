/**
 * Transaction Model
 * Handles all transaction-related database operations
 */

const { pool } = require('../config/database');

const Transaction = {
    /**
     * Create new transaction
     */
    async create(userId, transactionData) {
        const { wallet_id, category_id, type, amount, description, date, notes } = transactionData;
        
        const [result] = await pool.query(
            `INSERT INTO transactions 
            (user_id, wallet_id, category_id, type, amount, description, date, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, wallet_id, category_id, type, amount, description, date, notes || null]
        );
        
        return result.insertId;
    },
    
    /**
     * Find transaction by ID
     */
    async findById(id, userId) {
        const [rows] = await pool.query(
            `SELECT t.*, 
                    w.name as wallet_name, w.icon as wallet_icon, w.color as wallet_color,
                    c.name as category_name, c.icon as category_icon, c.color as category_color
             FROM transactions t
             LEFT JOIN wallets w ON t.wallet_id = w.id
             LEFT JOIN categories c ON t.category_id = c.id
             WHERE t.id = ? AND t.user_id = ?`,
            [id, userId]
        );
        
        return rows[0] || null;
    },
    
    /**
     * Get all transactions with filters and pagination
     */
    async findAll(userId, filters = {}, pagination = {}) {
        const { page = 1, limit = 20 } = pagination;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT t.*, 
                   w.name as wallet_name, w.icon as wallet_icon, w.color as wallet_color,
                   c.name as category_name, c.icon as category_icon, c.color as category_color
            FROM transactions t
            LEFT JOIN wallets w ON t.wallet_id = w.id
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = ?
        `;
        
        const params = [userId];
        
        // Apply filters
        if (filters.type) {
            query += ' AND t.type = ?';
            params.push(filters.type);
        }
        
        if (filters.wallet_id) {
            query += ' AND t.wallet_id = ?';
            params.push(filters.wallet_id);
        }
        
        if (filters.category_id) {
            query += ' AND t.category_id = ?';
            params.push(filters.category_id);
        }
        
        if (filters.start_date) {
            query += ' AND t.date >= ?';
            params.push(filters.start_date);
        }
        
        if (filters.end_date) {
            query += ' AND t.date <= ?';
            params.push(filters.end_date);
        }
        
        if (filters.search) {
            query += ' AND (t.description LIKE ? OR t.notes LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }
        
        // Get total count
        const countQuery = query.replace(/SELECT t\..*FROM/, 'SELECT COUNT(*) as total FROM');
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;
        
        // Add sorting and pagination
        query += ' ORDER BY t.date DESC, t.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const [rows] = await pool.query(query, params);
        
        return {
            transactions: rows,
            total,
            page,
            limit
        };
    },
    
    /**
     * Update transaction
     */
    async update(id, userId, transactionData) {
        const updates = [];
        const values = [];
        
        const allowedFields = ['wallet_id', 'category_id', 'type', 'amount', 'description', 'date', 'notes'];
        
        allowedFields.forEach(field => {
            if (transactionData[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(transactionData[field]);
            }
        });
        
        if (updates.length === 0) {
            return false;
        }
        
        values.push(id, userId);
        
        const [result] = await pool.query(
            `UPDATE transactions SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Delete transaction
     */
    async delete(id, userId) {
        const [result] = await pool.query(
            'DELETE FROM transactions WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Get transaction summary
     */
    async getSummary(userId, startDate = null, endDate = null) {
        let query = `
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
                COUNT(*) as total_transactions
            FROM transactions
            WHERE user_id = ?
        `;
        
        const params = [userId];
        
        if (startDate) {
            query += ' AND date >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            query += ' AND date <= ?';
            params.push(endDate);
        }
        
        const [rows] = await pool.query(query, params);
        const summary = rows[0];
        
        return {
            total_income: parseFloat(summary.total_income) || 0,
            total_expense: parseFloat(summary.total_expense) || 0,
            balance: parseFloat(summary.total_income - summary.total_expense) || 0,
            total_transactions: summary.total_transactions
        };
    },
    
    /**
     * Get transactions by category
     */
    async groupByCategory(userId, startDate = null, endDate = null) {
        let query = `
            SELECT 
                c.id, c.name, c.icon, c.color, c.type,
                COUNT(t.id) as transaction_count,
                COALESCE(SUM(t.amount), 0) as total_amount
            FROM categories c
            LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = ?
        `;
        
        const params = [userId];
        
        if (startDate) {
            query += ' AND t.date >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            query += ' AND t.date <= ?';
            params.push(endDate);
        }
        
        query += ' WHERE c.is_default = TRUE OR c.user_id = ? GROUP BY c.id ORDER BY total_amount DESC';
        params.push(userId);
        
        const [rows] = await pool.query(query, params);
        
        return rows.map(row => ({
            ...row,
            total_amount: parseFloat(row.total_amount) || 0
        }));
    },
    
    /**
     * Get monthly trend
     */
    async getMonthlyTrend(userId, year) {
        const [rows] = await pool.query(`
            SELECT 
                MONTH(date) as month,
                YEAR(date) as year,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
            FROM transactions
            WHERE user_id = ? AND YEAR(date) = ?
            GROUP BY YEAR(date), MONTH(date)
            ORDER BY month
        `, [userId, year]);
        
        return rows.map(row => ({
            ...row,
            total_income: parseFloat(row.total_income) || 0,
            total_expense: parseFloat(row.total_expense) || 0,
            balance: parseFloat(row.total_income - row.total_expense) || 0
        }));
    }
};

module.exports = Transaction;
