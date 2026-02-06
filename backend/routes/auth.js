/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, sanitizeBody } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  sanitizeBody,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Nama wajib diisi')
      .isLength({ min: 2, max: 100 }).withMessage('Nama harus antara 2-100 karakter'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email wajib diisi')
      .isEmail().withMessage('Format email tidak valid')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password wajib diisi')
      .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
  ],
  validate,
  AuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  sanitizeBody,
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email wajib diisi')
      .isEmail().withMessage('Format email tidak valid')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password wajib diisi')
  ],
  validate,
  AuthController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  AuthController.logout
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  AuthController.me
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  sanitizeBody,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Nama harus antara 2-100 karakter'),
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Format email tidak valid')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('avatar_url')
      .optional()
      .trim()
  ],
  validate,
  AuthController.updateProfile
);

module.exports = router;
