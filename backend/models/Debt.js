/**
 * Debt Model
 * Handles all debt-related database operations (hutang & piutang)
 */

const { pool } = require('../config/database');
const { isOverdue } = require('../utils/helpers');

const Debt = {
    /**
     * Create new debt
     */
    async create(userId, debtData) {
        const { type, person_name, amount, description, date, due_date, notes } = debtData;
        
        const [result] = await pool.query(
            `INSERT INTO debts 
            (user_id, type, person_name, amount, remaining_amount, description, date, due_date, notes, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [userId, type, person_name, amount, amount, description || null, date, due_date || null, notes || null]
        );
        
        return result.insertId;
    },
    
    /**
     * Find debt by ID
     */
    async findById(id, userId) {
        const [rows] = await pool.query(
            'SELECT * FROM debts WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        return rows[0] || null;
    },
    
    /**
     * Get all debts with filters
     */
    async findAll(userId, filters = {}) {
        let query = 'SELECT * FROM debts WHERE user_id = ?';
        const params = [userId];
        
        if (filters.type) {
            query += ' AND type = ?';
            params.push(filters.type);
        }
        
        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }
        
        if (filters.person_name) {
            query += ' AND person_name LIKE ?';
            params.push(`%${filters.person_name}%`);
        }
        
        query += ' ORDER BY date DESC, created_at DESC';
        
        const [rows] = await pool.query(query, params);
        
        // Update overdue status
        for (const debt of rows) {
            if (debt.status === 'active' && debt.due_date && isOverdue(debt.due_date)) {
                await this.updateStatus(debt.id, userId, 'overdue');
                debt.status = 'overdue';
            }
        }
        
        return rows;
    },
    
    /**
     * Update debt
     */
    async update(id, userId, debtData) {
        const updates = [];
        const values = [];
        
        const allowedFields = ['type', 'person_name', 'amount', 'remaining_amount', 'description', 'date', 'due_date', 'notes'];
        
        allowedFields.forEach(field => {
            if (debtData[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(debtData[field]);
            }
        });
        
        if (updates.length === 0) {
            return false;
        }
        
        values.push(id, userId);
        
        const [result] = await pool.query(
            `UPDATE debts SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Update debt status
     */
    async updateStatus(id, userId, status) {
        const [result] = await pool.query(
            'UPDATE debts SET status = ? WHERE id = ? AND user_id = ?',
            [status, id, userId]
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Mark debt as paid (full or partial)
     */
    async markAsPaid(id, userId, paidAmount = null) {
        const debt = await this.findById(id, userId);
        
        if (!debt) {
            throw new Error('Hutang/Piutang tidak ditemukan');
        }
        
        let newRemainingAmount;
        let newStatus;
        
        if (paidAmount === null || paidAmount >= debt.remaining_amount) {
            // Full payment
            newRemainingAmount = 0;
            newStatus = 'paid';
        } else {
            // Partial payment
            newRemainingAmount = debt.remaining_amount - paidAmount;
            newStatus = 'active';
        }
        
        const [result] = await pool.query(
            'UPDATE debts SET remaining_amount = ?, status = ? WHERE id = ? AND user_id = ?',
            [newRemainingAmount, newStatus, id, userId]
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Delete debt
     */
    async delete(id, userId) {
        const [result] = await pool.query(
            'DELETE FROM debts WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        return result.affectedRows > 0;
    },
    
    /**
     * Get debt summary
     */
    async getSummary(userId) {
        const [rows] = await pool.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'hutang' AND status != 'paid' THEN remaining_amount ELSE 0 END), 0) as total_hutang,
                COALESCE(SUM(CASE WHEN type = 'piutang' AND status != 'paid' THEN remaining_amount ELSE 0 END), 0) as total_piutang,
                COUNT(CASE WHEN type = 'hutang' AND status != 'paid' THEN 1 END) as active_hutang_count,
                COUNT(CASE WHEN type = 'piutang' AND status != 'paid' THEN 1 END) as active_piutang_count,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
            FROM debts
            WHERE user_id = ?
        `, [userId]);
        
        const summary = rows[0];
        
        return {
            total_hutang: parseFloat(summary.total_hutang) || 0,
            total_piutang: parseFloat(summary.total_piutang) || 0,
            active_hutang_count: summary.active_hutang_count,
            active_piutang_count: summary.active_piutang_count,
            overdue_count: summary.overdue_count
        };
    },
    
    /**
     * Get overdue debts
     */
    async getOverdue(userId) {
        const [rows] = await pool.query(
            `SELECT * FROM debts 
             WHERE user_id = ? AND status = 'active' AND due_date < CURDATE()
             ORDER BY due_date ASC`,
            [userId]
        );
        
        // Update status to overdue
        for (const debt of rows) {
            await this.updateStatus(debt.id, userId, 'overdue');
            debt.status = 'overdue';
        }
        
        return rows;
    }
};

module.exports = Debt;
