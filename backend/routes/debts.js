/**
 * Debt Routes
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const DebtController = require('../controllers/debtController');
const { authenticate } = require('../middleware/auth');
const { validate, sanitizeBody } = require('../middleware/validator');
const { createLimiter } = require('../middleware/rateLimiter');

/**
 * @route   GET /api/debts
 * @desc    Get all debts with filters
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  [
    query('type')
      .optional()
      .isIn(['hutang', 'piutang']).withMessage('Type harus hutang atau piutang'),
    query('status')
      .optional()
      .isIn(['active', 'paid', 'overdue']).withMessage('Status harus active, paid, atau overdue'),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1-100')
  ],
  validate,
  DebtController.getAll
);

/**
 * @route   GET /api/debts/summary
 * @desc    Get debt summary
 * @access  Private
 */
router.get(
  '/summary',
  authenticate,
  DebtController.getSummary
);

/**
 * @route   GET /api/debts/:id
 * @desc    Get single debt
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id').isInt().withMessage('ID hutang/piutang tidak valid')
  ],
  validate,
  DebtController.getById
);

/**
 * @route   POST /api/debts
 * @desc    Create new debt
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  createLimiter,
  sanitizeBody,
  [
    body('type')
      .notEmpty().withMessage('Type wajib diisi')
      .isIn(['hutang', 'piutang']).withMessage('Type harus hutang atau piutang'),
    body('person_name')
      .trim()
      .notEmpty().withMessage('Nama orang wajib diisi')
      .isLength({ min: 2, max: 100 }).withMessage('Nama orang harus antara 2-100 karakter'),
    body('amount')
      .notEmpty().withMessage('Jumlah wajib diisi')
      .isFloat({ min: 0.01 }).withMessage('Jumlah harus berupa angka positif'),
    body('remaining_amount')
      .optional()
      .isFloat({ min: 0 }).withMessage('Sisa jumlah harus berupa angka positif'),
    body('description')
      .trim()
      .notEmpty().withMessage('Deskripsi wajib diisi')
      .isLength({ min: 2, max: 255 }).withMessage('Deskripsi harus antara 2-255 karakter'),
    body('date')
      .notEmpty().withMessage('Tanggal wajib diisi')
      .isDate().withMessage('Format tanggal tidak valid'),
    body('due_date')
      .optional()
      .isDate().withMessage('Format tanggal jatuh tempo tidak valid'),
    body('status')
      .optional()
      .isIn(['active', 'paid', 'overdue']).withMessage('Status harus active, paid, atau overdue'),
    body('notes')
      .optional()
      .trim()
  ],
  validate,
  DebtController.create
);

/**
 * @route   PUT /api/debts/:id
 * @desc    Update debt
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  sanitizeBody,
  [
    param('id').isInt().withMessage('ID hutang/piutang tidak valid'),
    body('type')
      .optional()
      .isIn(['hutang', 'piutang']).withMessage('Type harus hutang atau piutang'),
    body('person_name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Nama orang harus antara 2-100 karakter'),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 }).withMessage('Jumlah harus berupa angka positif'),
    body('remaining_amount')
      .optional()
      .isFloat({ min: 0 }).withMessage('Sisa jumlah harus berupa angka positif'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Deskripsi harus antara 2-255 karakter'),
    body('date')
      .optional()
      .isDate().withMessage('Format tanggal tidak valid'),
    body('due_date')
      .optional()
      .isDate().withMessage('Format tanggal jatuh tempo tidak valid'),
    body('status')
      .optional()
      .isIn(['active', 'paid', 'overdue']).withMessage('Status harus active, paid, atau overdue'),
    body('notes')
      .optional()
      .trim()
  ],
  validate,
  DebtController.update
);

/**
 * @route   PATCH /api/debts/:id/pay
 * @desc    Mark debt as paid
 * @access  Private
 */
router.patch(
  '/:id/pay',
  authenticate,
  [
    param('id').isInt().withMessage('ID hutang/piutang tidak valid')
  ],
  validate,
  DebtController.markAsPaid
);

/**
 * @route   DELETE /api/debts/:id
 * @desc    Delete debt
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isInt().withMessage('ID hutang/piutang tidak valid')
  ],
  validate,
  DebtController.delete
);

module.exports = router;
