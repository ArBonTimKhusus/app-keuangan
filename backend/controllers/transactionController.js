/**
 * Transaction Controller
 */

const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Category = require('../models/Category');
const { success, created, notFound, error } = require('../utils/response');
const { buildPaginationMeta } = require('../utils/helpers');

const TransactionController = {
  /**
   * Get all transactions with filters and pagination
   */
  getAll: async (req, res, next) => {
    try {
      const { 
        type, 
        wallet_id, 
        category_id, 
        start_date, 
        end_date, 
        search,
        page = 1, 
        limit = 20 
      } = req.query;
      
      const filters = {};
      if (type) filters.type = type;
      if (wallet_id) filters.wallet_id = wallet_id;
      if (category_id) filters.category_id = category_id;
      if (start_date) filters.start_date = start_date;
      if (end_date) filters.end_date = end_date;
      if (search) filters.search = search;
      
      const [transactions, total] = await Promise.all([
        Transaction.findByUserId(req.user.id, filters, page, limit),
        Transaction.countByUserId(req.user.id, filters)
      ]);
      
      const pagination = buildPaginationMeta(total, page, limit);
      
      return success(res, { transactions, pagination }, 'Daftar transaksi berhasil diambil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single transaction by ID
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const transaction = await Transaction.findById(id);
      
      if (!transaction || transaction.user_id !== req.user.id) {
        return notFound(res, 'Transaksi tidak ditemukan');
      }
      
      return success(res, transaction, 'Data transaksi berhasil diambil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create new transaction
   */
  create: async (req, res, next) => {
    try {
      const { wallet_id, category_id, type, amount, description, date, notes } = req.body;
      
      // Validate wallet belongs to user
      const walletBelongsToUser = await Wallet.belongsToUser(wallet_id, req.user.id);
      if (!walletBelongsToUser) {
        return error(res, 'Dompet tidak valid', 400);
      }
      
      // Validate category is accessible by user
      const categoryAccessible = await Category.accessibleByUser(category_id, req.user.id);
      if (!categoryAccessible) {
        return error(res, 'Kategori tidak valid', 400);
      }
      
      const transactionData = {
        user_id: req.user.id,
        wallet_id,
        category_id,
        type,
        amount,
        description,
        date,
        notes: notes || null
      };
      
      const transaction = await Transaction.create(transactionData);
      
      return created(res, transaction, 'Transaksi berhasil dibuat');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update transaction
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { wallet_id, category_id, type, amount, description, date, notes } = req.body;
      
      // Check if transaction exists and belongs to user
      const transaction = await Transaction.findById(id);
      if (!transaction || transaction.user_id !== req.user.id) {
        return notFound(res, 'Transaksi tidak ditemukan');
      }
      
      const updateData = {};
      
      if (wallet_id) {
        const walletBelongsToUser = await Wallet.belongsToUser(wallet_id, req.user.id);
        if (!walletBelongsToUser) {
          return error(res, 'Dompet tidak valid', 400);
        }
        updateData.wallet_id = wallet_id;
      }
      
      if (category_id) {
        const categoryAccessible = await Category.accessibleByUser(category_id, req.user.id);
        if (!categoryAccessible) {
          return error(res, 'Kategori tidak valid', 400);
        }
        updateData.category_id = category_id;
      }
      
      if (type) updateData.type = type;
      if (amount !== undefined) updateData.amount = amount;
      if (description) updateData.description = description;
      if (date) updateData.date = date;
      if (notes !== undefined) updateData.notes = notes;
      
      const updatedTransaction = await Transaction.update(id, req.user.id, updateData);
      
      return success(res, updatedTransaction, 'Transaksi berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete transaction
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check if transaction exists and belongs to user
      const transaction = await Transaction.findById(id);
      if (!transaction || transaction.user_id !== req.user.id) {
        return notFound(res, 'Transaksi tidak ditemukan');
      }
      
      const deleted = await Transaction.delete(id, req.user.id);
      
      if (!deleted) {
        return error(res, 'Gagal menghapus transaksi', 400);
      }
      
      return success(res, null, 'Transaksi berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = TransactionController;
