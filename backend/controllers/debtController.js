/**
 * Debt Controller
 */

const Debt = require('../models/Debt');
const { success, created, notFound, error } = require('../utils/response');
const { buildPaginationMeta } = require('../utils/helpers');

const DebtController = {
  /**
   * Get all debts with filters and pagination
   */
  getAll: async (req, res, next) => {
    try {
      const { type, status, search, page = 1, limit = 20 } = req.query;
      
      const filters = {};
      if (type) filters.type = type;
      if (status) filters.status = status;
      if (search) filters.search = search;
      
      const [debts, total] = await Promise.all([
        Debt.findByUserId(req.user.id, filters, page, limit),
        Debt.countByUserId(req.user.id, filters)
      ]);
      
      const pagination = buildPaginationMeta(total, page, limit);
      
      return success(res, { debts, pagination }, 'Daftar hutang/piutang berhasil diambil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single debt by ID
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const debt = await Debt.findById(id);
      
      if (!debt || debt.user_id !== req.user.id) {
        return notFound(res, 'Hutang/piutang tidak ditemukan');
      }
      
      return success(res, debt, 'Data hutang/piutang berhasil diambil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create new debt
   */
  create: async (req, res, next) => {
    try {
      const { 
        type, 
        person_name, 
        amount, 
        remaining_amount, 
        description, 
        date, 
        due_date, 
        status, 
        notes 
      } = req.body;
      
      const debtData = {
        user_id: req.user.id,
        type,
        person_name,
        amount,
        remaining_amount: remaining_amount !== undefined ? remaining_amount : amount,
        description,
        date,
        due_date: due_date || null,
        status: status || 'active',
        notes: notes || null
      };
      
      const debt = await Debt.create(debtData);
      
      return created(res, debt, 'Hutang/piutang berhasil dibuat');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update debt
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { 
        type, 
        person_name, 
        amount, 
        remaining_amount, 
        description, 
        date, 
        due_date, 
        status, 
        notes 
      } = req.body;
      
      // Check if debt exists and belongs to user
      const debt = await Debt.findById(id);
      if (!debt || debt.user_id !== req.user.id) {
        return notFound(res, 'Hutang/piutang tidak ditemukan');
      }
      
      const updateData = {};
      if (type) updateData.type = type;
      if (person_name) updateData.person_name = person_name;
      if (amount !== undefined) updateData.amount = amount;
      if (remaining_amount !== undefined) updateData.remaining_amount = remaining_amount;
      if (description) updateData.description = description;
      if (date) updateData.date = date;
      if (due_date !== undefined) updateData.due_date = due_date;
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      
      const updatedDebt = await Debt.update(id, req.user.id, updateData);
      
      return success(res, updatedDebt, 'Hutang/piutang berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Mark debt as paid
   */
  markAsPaid: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check if debt exists and belongs to user
      const debt = await Debt.findById(id);
      if (!debt || debt.user_id !== req.user.id) {
        return notFound(res, 'Hutang/piutang tidak ditemukan');
      }
      
      const updatedDebt = await Debt.markAsPaid(id, req.user.id);
      
      return success(res, updatedDebt, 'Hutang/piutang berhasil ditandai lunas');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete debt
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check if debt exists and belongs to user
      const debt = await Debt.findById(id);
      if (!debt || debt.user_id !== req.user.id) {
        return notFound(res, 'Hutang/piutang tidak ditemukan');
      }
      
      const deleted = await Debt.delete(id, req.user.id);
      
      if (!deleted) {
        return error(res, 'Gagal menghapus hutang/piutang', 400);
      }
      
      return success(res, null, 'Hutang/piutang berhasil dihapus');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get debt summary
   */
  getSummary: async (req, res, next) => {
    try {
      const summary = await Debt.getSummary(req.user.id);
      return success(res, summary, 'Ringkasan hutang/piutang berhasil diambil');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = DebtController;
