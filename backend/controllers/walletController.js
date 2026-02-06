/**
 * Wallet Controller
 * Handles all wallet-related operations
 */

const Wallet = require('../models/Wallet');
const response = require('../utils/response');

const walletController = {
    /**
     * Get all user wallets
     * GET /api/wallets
     */
    async getAll(req, res, next) {
        try {
            const userId = req.user.id;
            
            const wallets = await Wallet.findAll(userId);
            
            // Get total balance
            const totalBalance = await Wallet.getTotalBalance(userId);
            
            return response.success(res, {
                wallets,
                total_balance: totalBalance
            }, 'Dompet berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get single wallet with statistics
     * GET /api/wallets/:id
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            const wallet = await Wallet.findByIdWithStats(id, userId);
            
            if (!wallet) {
                return response.notFound(res, 'Dompet tidak ditemukan');
            }
            
            return response.success(res, wallet, 'Dompet berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Create new wallet
     * POST /api/wallets
     */
    async create(req, res, next) {
        try {
            const userId = req.user.id;
            const walletData = req.body;
            
            // Create wallet
            const walletId = await Wallet.create(userId, walletData);
            
            // Get created wallet
            const wallet = await Wallet.findById(walletId, userId);
            
            return response.created(res, wallet, 'Dompet berhasil ditambahkan');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Update wallet
     * PUT /api/wallets/:id
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const walletData = req.body;
            
            // Check if wallet exists
            const existingWallet = await Wallet.findById(id, userId);
            if (!existingWallet) {
                return response.notFound(res, 'Dompet tidak ditemukan');
            }
            
            // Update wallet
            const updated = await Wallet.update(id, userId, walletData);
            
            if (!updated) {
                return response.error(res, 'Tidak ada perubahan yang dilakukan');
            }
            
            // Get updated wallet
            const wallet = await Wallet.findById(id, userId);
            
            return response.success(res, wallet, 'Dompet berhasil diperbarui');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Delete wallet
     * DELETE /api/wallets/:id
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            // Check if wallet exists
            const wallet = await Wallet.findById(id, userId);
            if (!wallet) {
                return response.notFound(res, 'Dompet tidak ditemukan');
            }
            
            // Delete wallet
            try {
                const deleted = await Wallet.delete(id, userId);
                
                if (!deleted) {
                    return response.error(res, 'Gagal menghapus dompet');
                }
                
                return response.success(res, null, 'Dompet berhasil dihapus');
            } catch (error) {
                if (error.message.includes('transaksi')) {
                    return response.error(res, error.message, 409);
                }
                throw error;
            }
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Update wallet balance manually
     * PATCH /api/wallets/:id/balance
     */
    async updateBalance(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { balance } = req.body;
            
            if (balance === undefined || balance < 0) {
                return response.error(res, 'Saldo tidak valid');
            }
            
            // Check if wallet exists
            const wallet = await Wallet.findById(id, userId);
            if (!wallet) {
                return response.notFound(res, 'Dompet tidak ditemukan');
            }
            
            // Update balance
            const updated = await Wallet.updateBalance(id, userId, balance);
            
            if (!updated) {
                return response.error(res, 'Gagal memperbarui saldo');
            }
            
            // Get updated wallet
            const updatedWallet = await Wallet.findById(id, userId);
            
            return response.success(res, updatedWallet, 'Saldo dompet berhasil diperbarui');
            
        } catch (error) {
            next(error);
        }
    }
};

module.exports = walletController;
