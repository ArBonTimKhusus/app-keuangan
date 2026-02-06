/**
 * Transaction Controller
 * Handles all transaction-related operations
 */

const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Category = require('../models/Category');
const response = require('../utils/response');
const { parsePaginationParams } = require('../utils/helpers');

const transactionController = {
    /**
     * Get all transactions
     * GET /api/transactions
     */
    async getAll(req, res, next) {
        try {
            const userId = req.user.id;
            const { page, limit, offset } = parsePaginationParams(req.query);
            
            // Build filters
            const filters = {};
            if (req.query.type) filters.type = req.query.type;
            if (req.query.wallet_id) filters.wallet_id = req.query.wallet_id;
            if (req.query.category_id) filters.category_id = req.query.category_id;
            if (req.query.start_date) filters.start_date = req.query.start_date;
            if (req.query.end_date) filters.end_date = req.query.end_date;
            if (req.query.search) filters.search = req.query.search;
            
            const result = await Transaction.findAll(userId, filters, { page, limit });
            
            return response.paginated(
                res,
                result.transactions,
                result.page,
                result.limit,
                result.total,
                'Transaksi berhasil diambil'
            );
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get single transaction
     * GET /api/transactions/:id
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            const transaction = await Transaction.findById(id, userId);
            
            if (!transaction) {
                return response.notFound(res, 'Transaksi tidak ditemukan');
            }
            
            return response.success(res, transaction, 'Transaksi berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Create new transaction
     * POST /api/transactions
     */
    async create(req, res, next) {
        try {
            const userId = req.user.id;
            const transactionData = req.body;
            
            // Verify wallet belongs to user
            const wallet = await Wallet.findById(transactionData.wallet_id, userId);
            if (!wallet) {
                return response.notFound(res, 'Dompet tidak ditemukan');
            }
            
            // Verify category exists and is accessible to user
            const category = await Category.findById(transactionData.category_id, userId);
            if (!category) {
                return response.notFound(res, 'Kategori tidak ditemukan');
            }
            
            // Create transaction
            const transactionId = await Transaction.create(userId, transactionData);
            
            // Get created transaction
            const transaction = await Transaction.findById(transactionId, userId);
            
            return response.created(res, transaction, 'Transaksi berhasil ditambahkan');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Update transaction
     * PUT /api/transactions/:id
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const transactionData = req.body;
            
            // Check if transaction exists
            const existingTransaction = await Transaction.findById(id, userId);
            if (!existingTransaction) {
                return response.notFound(res, 'Transaksi tidak ditemukan');
            }
            
            // If wallet is being changed, verify it belongs to user
            if (transactionData.wallet_id) {
                const wallet = await Wallet.findById(transactionData.wallet_id, userId);
                if (!wallet) {
                    return response.notFound(res, 'Dompet tidak ditemukan');
                }
            }
            
            // If category is being changed, verify it's accessible
            if (transactionData.category_id) {
                const category = await Category.findById(transactionData.category_id, userId);
                if (!category) {
                    return response.notFound(res, 'Kategori tidak ditemukan');
                }
            }
            
            // Update transaction
            const updated = await Transaction.update(id, userId, transactionData);
            
            if (!updated) {
                return response.error(res, 'Tidak ada perubahan yang dilakukan');
            }
            
            // Get updated transaction
            const transaction = await Transaction.findById(id, userId);
            
            return response.success(res, transaction, 'Transaksi berhasil diperbarui');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Delete transaction
     * DELETE /api/transactions/:id
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            // Check if transaction exists
            const transaction = await Transaction.findById(id, userId);
            if (!transaction) {
                return response.notFound(res, 'Transaksi tidak ditemukan');
            }
            
            // Delete transaction
            const deleted = await Transaction.delete(id, userId);
            
            if (!deleted) {
                return response.error(res, 'Gagal menghapus transaksi');
            }
            
            return response.success(res, null, 'Transaksi berhasil dihapus');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get transaction summary
     * GET /api/transactions/summary
     */
    async getSummary(req, res, next) {
        try {
            const userId = req.user.id;
            const { start_date, end_date } = req.query;
            
            const summary = await Transaction.getSummary(userId, start_date, end_date);
            
            return response.success(res, summary, 'Ringkasan transaksi berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    }
};

module.exports = transactionController;
