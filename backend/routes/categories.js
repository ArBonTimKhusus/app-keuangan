/**
 * Category Routes
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const CategoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { validate, sanitizeBody } = require('../middleware/validator');
const { createLimiter } = require('../middleware/rateLimiter');

/**
 * @route   GET /api/categories
 * @desc    Get all categories (defaults + user custom)
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  [
    query('type')
      .optional()
      .isIn(['income', 'expense', 'both']).withMessage('Type harus income, expense, atau both')
  ],
  validate,
  CategoryController.getAll
);

/**
 * @route   POST /api/categories
 * @desc    Create custom category
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
      .notEmpty().withMessage('Nama kategori wajib diisi')
      .isLength({ min: 2, max: 100 }).withMessage('Nama kategori harus antara 2-100 karakter'),
    body('type')
      .optional()
      .isIn(['income', 'expense', 'both']).withMessage('Type harus income, expense, atau both'),
    body('icon')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Icon maksimal 50 karakter'),
    body('color')
      .optional()
      .trim()
      .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color harus dalam format hex (#RRGGBB)')
  ],
  validate,
  CategoryController.create
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  sanitizeBody,
  [
    param('id').isInt().withMessage('ID kategori tidak valid'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Nama kategori harus antara 2-100 karakter'),
    body('type')
      .optional()
      .isIn(['income', 'expense', 'both']).withMessage('Type harus income, expense, atau both'),
    body('icon')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Icon maksimal 50 karakter'),
    body('color')
      .optional()
      .trim()
      .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color harus dalam format hex (#RRGGBB)')
  ],
  validate,
  CategoryController.update
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (only custom ones)
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isInt().withMessage('ID kategori tidak valid')
  ],
  validate,
  CategoryController.delete
);

module.exports = router;
