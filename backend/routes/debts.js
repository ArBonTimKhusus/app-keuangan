/**
 * Debt Routes
 * Full CRUD operations for debts (hutang & piutang)
 */

const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debtController');
const { authenticate } = require('../middleware/auth');
const { debtValidation, idValidation } = require('../middleware/validator');
const { writeLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(authenticate);

// GET routes
router.get('/', debtController.getAll);
router.get('/summary', debtController.getSummary);
router.get('/overdue', debtController.getOverdue);
router.get('/:id', idValidation, debtController.getById);

// POST routes (rate limited)
router.post('/', writeLimiter, debtValidation, debtController.create);

// PUT/PATCH routes (rate limited)
router.put('/:id', writeLimiter, idValidation, debtValidation, debtController.update);
router.patch('/:id/pay', writeLimiter, idValidation, debtController.pay);

// DELETE routes (rate limited)
router.delete('/:id', writeLimiter, idValidation, debtController.delete);

module.exports = router;
