/**
 * Wallet Routes
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const WalletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');
const { validate, sanitizeBody } = require('../middleware/validator');
const { createLimiter } = require('../middleware/rateLimiter');

/**
 * @route   GET /api/wallets
 * @desc    Get all wallets for current user
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  WalletController.getAll
);

/**
 * @route   GET /api/wallets/:id
 * @desc    Get single wallet by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id').isInt().withMessage('ID wallet tidak valid')
  ],
  validate,
  WalletController.getById
);

/**
 * @route   POST /api/wallets
 * @desc    Create new wallet
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  createLimiter,
  sanitizeBody,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Nama dompet wajib diisi')
      .isLength({ min: 2, max: 100 }).withMessage('Nama dompet harus antara 2-100 karakter'),
    body('icon')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Icon maksimal 50 karakter'),
    body('balance')
      .optional()
      .isFloat({ min: 0 }).withMessage('Saldo harus berupa angka positif'),
    body('color')
      .optional()
      .trim()
      .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color harus dalam format hex (#RRGGBB)'),
    body('is_default')
      .optional()
      .isBoolean().withMessage('is_default harus berupa boolean')
  ],
  validate,
  WalletController.create
);

/**
 * @route   PUT /api/wallets/:id
 * @desc    Update wallet
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  sanitizeBody,
  [
    param('id').isInt().withMessage('ID wallet tidak valid'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Nama dompet harus antara 2-100 karakter'),
    body('icon')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Icon maksimal 50 karakter'),
    body('color')
      .optional()
      .trim()
      .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color harus dalam format hex (#RRGGBB)'),
    body('is_default')
      .optional()
      .isBoolean().withMessage('is_default harus berupa boolean')
  ],
  validate,
  WalletController.update
);

/**
 * @route   DELETE /api/wallets/:id
 * @desc    Delete wallet
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isInt().withMessage('ID wallet tidak valid')
  ],
  validate,
  WalletController.delete
);

module.exports = router;
