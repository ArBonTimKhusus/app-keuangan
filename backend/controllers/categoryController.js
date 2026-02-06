/**
 * Category Controller
 * Handles all category-related operations
 */

const Category = require('../models/Category');
const response = require('../utils/response');

const categoryController = {
    /**
     * Get all categories (defaults + user custom)
     * GET /api/categories
     */
    async getAll(req, res, next) {
        try {
            const userId = req.user.id;
            const { type } = req.query; // Filter by type: income, expense, or both
            
            const categories = await Category.findAll(userId, type);
            
            return response.success(res, categories, 'Kategori berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get single category
     * GET /api/categories/:id
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            const category = await Category.findById(id, userId);
            
            if (!category) {
                return response.notFound(res, 'Kategori tidak ditemukan');
            }
            
            // Get usage statistics
            const stats = await Category.getUsageStats(id, userId);
            
            return response.success(res, {
                ...category,
                stats
            }, 'Kategori berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Create custom category
     * POST /api/categories
     */
    async create(req, res, next) {
        try {
            const userId = req.user.id;
            const categoryData = req.body;
            
            // Create category
            const categoryId = await Category.create(userId, categoryData);
            
            // Get created category
            const category = await Category.findById(categoryId, userId);
            
            return response.created(res, category, 'Kategori berhasil ditambahkan');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Update category
     * PUT /api/categories/:id
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const categoryData = req.body;
            
            try {
                // Update category
                const updated = await Category.update(id, userId, categoryData);
                
                if (!updated) {
                    return response.error(res, 'Tidak ada perubahan yang dilakukan');
                }
                
                // Get updated category
                const category = await Category.findById(id, userId);
                
                return response.success(res, category, 'Kategori berhasil diperbarui');
            } catch (error) {
                if (error.message.includes('default') || error.message.includes('orang lain')) {
                    return response.forbidden(res, error.message);
                }
                throw error;
            }
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Delete category
     * DELETE /api/categories/:id
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            try {
                // Delete category
                const deleted = await Category.delete(id, userId);
                
                if (!deleted) {
                    return response.error(res, 'Gagal menghapus kategori');
                }
                
                return response.success(res, null, 'Kategori berhasil dihapus');
            } catch (error) {
                if (error.message.includes('default') || 
                    error.message.includes('orang lain') || 
                    error.message.includes('transaksi')) {
                    return response.forbidden(res, error.message);
                }
                throw error;
            }
            
        } catch (error) {
            next(error);
        }
    }
};

module.exports = categoryController;
