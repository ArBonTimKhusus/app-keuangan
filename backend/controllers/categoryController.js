/**
 * Category Controller
 */

const Category = require('../models/Category');
const { success, created, notFound, error } = require('../utils/response');

const CategoryController = {
  /**
   * Get all categories for current user (including defaults)
   */
  getAll: async (req, res, next) => {
    try {
      const { type } = req.query;
      const categories = await Category.findByUserId(req.user.id, type);
      return success(res, categories, 'Daftar kategori berhasil diambil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create new custom category
   */
  create: async (req, res, next) => {
    try {
      const { name, type, icon, color } = req.body;
      
      const categoryData = {
        user_id: req.user.id,
        name,
        type: type || 'expense',
        icon: icon || 'tag',
        color: color || '#2196F3'
      };
      
      const category = await Category.create(categoryData);
      
      return created(res, category, 'Kategori berhasil dibuat');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update category
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, type, icon, color } = req.body;
      
      // Check if category exists and is editable
      const category = await Category.findById(id);
      if (!category) {
        return notFound(res, 'Kategori tidak ditemukan');
      }
      
      if (category.is_default) {
        return error(res, 'Kategori default tidak dapat diubah', 403);
      }
      
      if (category.user_id !== req.user.id) {
        return error(res, 'Anda tidak memiliki akses untuk mengubah kategori ini', 403);
      }
      
      const updateData = {};
      if (name) updateData.name = name;
      if (type) updateData.type = type;
      if (icon) updateData.icon = icon;
      if (color) updateData.color = color;
      
      const updatedCategory = await Category.update(id, req.user.id, updateData);
      
      return success(res, updatedCategory, 'Kategori berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete custom category
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check if category exists
      const category = await Category.findById(id);
      if (!category) {
        return notFound(res, 'Kategori tidak ditemukan');
      }
      
      if (category.is_default) {
        return error(res, 'Kategori default tidak dapat dihapus', 403);
      }
      
      if (category.user_id !== req.user.id) {
        return error(res, 'Anda tidak memiliki akses untuk menghapus kategori ini', 403);
      }
      
      const deleted = await Category.delete(id, req.user.id);
      
      if (!deleted) {
        return error(res, 'Gagal menghapus kategori', 400);
      }
      
      return success(res, null, 'Kategori berhasil dihapus');
    } catch (err) {
      if (err.message.includes('transaksi')) {
        return error(res, err.message, 400);
      }
      next(err);
    }
  }
};

module.exports = CategoryController;
