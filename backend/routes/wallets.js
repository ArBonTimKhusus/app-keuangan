/**
 * Wallet Routes
 * Full CRUD operations for wallets
 */

const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');
const { walletValidation, idValidation } = require('../middleware/validator');
const { writeLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(authenticate);

// GET routes
router.get('/', walletController.getAll);
router.get('/:id', idValidation, walletController.getById);

// POST routes (rate limited)
router.post('/', writeLimiter, walletValidation, walletController.create);

// PUT/PATCH routes (rate limited)
router.put('/:id', writeLimiter, idValidation, walletValidation, walletController.update);
router.patch('/:id/balance', writeLimiter, idValidation, walletController.updateBalance);

// DELETE routes (rate limited)
router.delete('/:id', writeLimiter, idValidation, walletController.delete);

module.exports = router;
