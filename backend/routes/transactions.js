/**
 * Transaction Routes
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const TransactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { validate, sanitizeBody } = require('../middleware/validator');
const { createLimiter } = require('../middleware/rateLimiter');

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with filters
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  [
    query('type')
      .optional()
      .isIn(['income', 'expense']).withMessage('Type harus income atau expense'),
    query('wallet_id')
      .optional()
      .isInt().withMessage('Wallet ID harus berupa angka'),
    query('category_id')
      .optional()
      .isInt().withMessage('Category ID harus berupa angka'),
    query('start_date')
      .optional()
      .isDate().withMessage('Format tanggal mulai tidak valid'),
    query('end_date')
      .optional()
      .isDate().withMessage('Format tanggal akhir tidak valid'),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1-100')
  ],
  validate,
  TransactionController.getAll
);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id').isInt().withMessage('ID transaksi tidak valid')
  ],
  validate,
  TransactionController.getById
);

/**
 * @route   POST /api/transactions
 * @desc    Create new transaction
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  createLimiter,
  sanitizeBody,
  [
    body('wallet_id')
      .notEmpty().withMessage('Wallet ID wajib diisi')
      .isInt().withMessage('Wallet ID harus berupa angka'),
    body('category_id')
      .notEmpty().withMessage('Category ID wajib diisi')
      .isInt().withMessage('Category ID harus berupa angka'),
    body('type')
      .notEmpty().withMessage('Type wajib diisi')
      .isIn(['income', 'expense']).withMessage('Type harus income atau expense'),
    body('amount')
      .notEmpty().withMessage('Jumlah wajib diisi')
      .isFloat({ min: 0.01 }).withMessage('Jumlah harus berupa angka positif'),
    body('description')
      .trim()
      .notEmpty().withMessage('Deskripsi wajib diisi')
      .isLength({ min: 2, max: 255 }).withMessage('Deskripsi harus antara 2-255 karakter'),
    body('date')
      .notEmpty().withMessage('Tanggal wajib diisi')
      .isDate().withMessage('Format tanggal tidak valid'),
    body('notes')
      .optional()
      .trim()
  ],
  validate,
  TransactionController.create
);

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update transaction
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  sanitizeBody,
  [
    param('id').isInt().withMessage('ID transaksi tidak valid'),
    body('wallet_id')
      .optional()
      .isInt().withMessage('Wallet ID harus berupa angka'),
    body('category_id')
      .optional()
      .isInt().withMessage('Category ID harus berupa angka'),
    body('type')
      .optional()
      .isIn(['income', 'expense']).withMessage('Type harus income atau expense'),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 }).withMessage('Jumlah harus berupa angka positif'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Deskripsi harus antara 2-255 karakter'),
    body('date')
      .optional()
      .isDate().withMessage('Format tanggal tidak valid'),
    body('notes')
      .optional()
      .trim()
  ],
  validate,
  TransactionController.update
);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete transaction
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isInt().withMessage('ID transaksi tidak valid')
  ],
  validate,
  TransactionController.delete
);

module.exports = router;
