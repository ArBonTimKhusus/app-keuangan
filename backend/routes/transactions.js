/**
 * Transaction Routes
 * Full CRUD operations for transactions
 */

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { transactionValidation, idValidation, paginationValidation } = require('../middleware/validator');
const { writeLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(authenticate);

// GET routes
router.get('/', paginationValidation, transactionController.getAll);
router.get('/summary', transactionController.getSummary);
router.get('/:id', idValidation, transactionController.getById);

// POST routes (rate limited)
router.post('/', writeLimiter, transactionValidation, transactionController.create);

// PUT routes (rate limited)
router.put('/:id', writeLimiter, idValidation, transactionValidation, transactionController.update);

// DELETE routes (rate limited)
router.delete('/:id', writeLimiter, idValidation, transactionController.delete);

module.exports = router;
