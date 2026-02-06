/**
 * Wallet Controller
 */

const Wallet = require('../models/Wallet');
const { success, created, notFound, error } = require('../utils/response');

const WalletController = {
  /**
   * Get all wallets for current user
   */
  getAll: async (req, res, next) => {
    try {
      const wallets = await Wallet.findByUserId(req.user.id);
      return success(res, wallets, 'Daftar dompet berhasil diambil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single wallet by ID
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const wallet = await Wallet.findById(id);
      
      if (!wallet || wallet.user_id !== req.user.id) {
        return notFound(res, 'Dompet tidak ditemukan');
      }
      
      return success(res, wallet, 'Data dompet berhasil diambil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create new wallet
   */
  create: async (req, res, next) => {
    try {
      const { name, icon, balance, color, is_default } = req.body;
      
      const walletData = {
        user_id: req.user.id,
        name,
        icon: icon || 'wallet',
        balance: balance || 0,
        color: color || '#4CAF50',
        is_default: is_default || false
      };
      
      const wallet = await Wallet.create(walletData);
      
      return created(res, wallet, 'Dompet berhasil dibuat');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update wallet
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, icon, color, is_default } = req.body;
      
      // Check if wallet exists and belongs to user
      const wallet = await Wallet.findById(id);
      if (!wallet || wallet.user_id !== req.user.id) {
        return notFound(res, 'Dompet tidak ditemukan');
      }
      
      const updateData = {};
      if (name) updateData.name = name;
      if (icon) updateData.icon = icon;
      if (color) updateData.color = color;
      if (is_default !== undefined) updateData.is_default = is_default;
      
      const updatedWallet = await Wallet.update(id, req.user.id, updateData);
      
      return success(res, updatedWallet, 'Dompet berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete wallet
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check if wallet exists and belongs to user
      const wallet = await Wallet.findById(id);
      if (!wallet || wallet.user_id !== req.user.id) {
        return notFound(res, 'Dompet tidak ditemukan');
      }
      
      const deleted = await Wallet.delete(id, req.user.id);
      
      if (!deleted) {
        return error(res, 'Gagal menghapus dompet', 400);
      }
      
      return success(res, null, 'Dompet berhasil dihapus');
    } catch (err) {
      if (err.message.includes('transaksi')) {
        return error(res, err.message, 400);
      }
      next(err);
    }
  }
};

module.exports = WalletController;
