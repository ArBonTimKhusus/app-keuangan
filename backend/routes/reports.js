/**
 * Report Routes
 */

const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const ReportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

/**
 * @route   GET /api/reports/summary
 * @desc    Get summary report (total income, expense, balance)
 * @access  Private
 */
router.get(
  '/summary',
  authenticate,
  [
    query('start_date')
      .optional()
      .isDate().withMessage('Format tanggal mulai tidak valid'),
    query('end_date')
      .optional()
      .isDate().withMessage('Format tanggal akhir tidak valid'),
    query('period')
      .optional()
      .isIn(['today', 'week', 'month', 'year']).withMessage('Period harus today, week, month, atau year')
  ],
  validate,
  ReportController.getSummary
);

/**
 * @route   GET /api/reports/by-category
 * @desc    Get breakdown by category
 * @access  Private
 */
router.get(
  '/by-category',
  authenticate,
  [
    query('start_date')
      .optional()
      .isDate().withMessage('Format tanggal mulai tidak valid'),
    query('end_date')
      .optional()
      .isDate().withMessage('Format tanggal akhir tidak valid'),
    query('period')
      .optional()
      .isIn(['today', 'week', 'month', 'year']).withMessage('Period harus today, week, month, atau year'),
    query('type')
      .optional()
      .isIn(['income', 'expense']).withMessage('Type harus income atau expense')
  ],
  validate,
  ReportController.getByCategory
);

/**
 * @route   GET /api/reports/by-wallet
 * @desc    Get breakdown by wallet
 * @access  Private
 */
router.get(
  '/by-wallet',
  authenticate,
  [
    query('start_date')
      .optional()
      .isDate().withMessage('Format tanggal mulai tidak valid'),
    query('end_date')
      .optional()
      .isDate().withMessage('Format tanggal akhir tidak valid'),
    query('period')
      .optional()
      .isIn(['today', 'week', 'month', 'year']).withMessage('Period harus today, week, month, atau year')
  ],
  validate,
  ReportController.getByWallet
);

/**
 * @route   GET /api/reports/monthly
 * @desc    Get monthly trend
 * @access  Private
 */
router.get(
  '/monthly',
  authenticate,
  [
    query('year')
      .optional()
      .isInt({ min: 2000, max: 2100 }).withMessage('Year harus antara 2000-2100')
  ],
  validate,
  ReportController.getMonthly
);

module.exports = router;
