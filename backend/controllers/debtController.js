/**
 * Debt Controller
 * Handles all debt-related operations (hutang & piutang)
 */

const Debt = require('../models/Debt');
const response = require('../utils/response');

const debtController = {
    /**
     * Get all debts
     * GET /api/debts
     */
    async getAll(req, res, next) {
        try {
            const userId = req.user.id;
            
            // Build filters
            const filters = {};
            if (req.query.type) filters.type = req.query.type;
            if (req.query.status) filters.status = req.query.status;
            if (req.query.person_name) filters.person_name = req.query.person_name;
            
            const debts = await Debt.findAll(userId, filters);
            
            return response.success(res, debts, 'Hutang/Piutang berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get single debt
     * GET /api/debts/:id
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            const debt = await Debt.findById(id, userId);
            
            if (!debt) {
                return response.notFound(res, 'Hutang/Piutang tidak ditemukan');
            }
            
            return response.success(res, debt, 'Hutang/Piutang berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Create new debt
     * POST /api/debts
     */
    async create(req, res, next) {
        try {
            const userId = req.user.id;
            const debtData = req.body;
            
            // Create debt
            const debtId = await Debt.create(userId, debtData);
            
            // Get created debt
            const debt = await Debt.findById(debtId, userId);
            
            return response.created(res, debt, 'Hutang/Piutang berhasil ditambahkan');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Update debt
     * PUT /api/debts/:id
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const debtData = req.body;
            
            // Check if debt exists
            const existingDebt = await Debt.findById(id, userId);
            if (!existingDebt) {
                return response.notFound(res, 'Hutang/Piutang tidak ditemukan');
            }
            
            // Update debt
            const updated = await Debt.update(id, userId, debtData);
            
            if (!updated) {
                return response.error(res, 'Tidak ada perubahan yang dilakukan');
            }
            
            // Get updated debt
            const debt = await Debt.findById(id, userId);
            
            return response.success(res, debt, 'Hutang/Piutang berhasil diperbarui');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Mark debt as paid (full or partial payment)
     * PATCH /api/debts/:id/pay
     */
    async pay(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { amount } = req.body; // Optional: partial payment amount
            
            // Check if debt exists
            const existingDebt = await Debt.findById(id, userId);
            if (!existingDebt) {
                return response.notFound(res, 'Hutang/Piutang tidak ditemukan');
            }
            
            // Validate amount if provided
            if (amount !== undefined && (amount <= 0 || amount > existingDebt.remaining_amount)) {
                return response.error(res, 'Jumlah pembayaran tidak valid');
            }
            
            // Mark as paid
            try {
                await Debt.markAsPaid(id, userId, amount);
                
                // Get updated debt
                const debt = await Debt.findById(id, userId);
                
                const message = debt.status === 'paid' 
                    ? 'Hutang/Piutang berhasil dilunasi' 
                    : 'Pembayaran sebagian berhasil dicatat';
                
                return response.success(res, debt, message);
            } catch (error) {
                return response.error(res, error.message);
            }
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Delete debt
     * DELETE /api/debts/:id
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            // Check if debt exists
            const debt = await Debt.findById(id, userId);
            if (!debt) {
                return response.notFound(res, 'Hutang/Piutang tidak ditemukan');
            }
            
            // Delete debt
            const deleted = await Debt.delete(id, userId);
            
            if (!deleted) {
                return response.error(res, 'Gagal menghapus hutang/piutang');
            }
            
            return response.success(res, null, 'Hutang/Piutang berhasil dihapus');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get debt summary
     * GET /api/debts/summary
     */
    async getSummary(req, res, next) {
        try {
            const userId = req.user.id;
            
            const summary = await Debt.getSummary(userId);
            
            return response.success(res, summary, 'Ringkasan hutang/piutang berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get overdue debts
     * GET /api/debts/overdue
     */
    async getOverdue(req, res, next) {
        try {
            const userId = req.user.id;
            
            const overdueDebts = await Debt.getOverdue(userId);
            
            return response.success(res, overdueDebts, 'Hutang/Piutang jatuh tempo berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    }
};

module.exports = debtController;
