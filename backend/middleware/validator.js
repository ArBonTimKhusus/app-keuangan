/**
 * Input Validation Middleware
 * Validates and sanitizes request input using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const response = require('../utils/response');

/**
 * Middleware to check validation results
 */
function validate(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg
        }));
        
        return response.validationError(res, formattedErrors);
    }
    
    next();
}

/**
 * Registration validation rules
 */
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama harus diisi')
        .isLength({ min: 2, max: 100 }).withMessage('Nama harus antara 2-100 karakter'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email harus diisi')
        .isEmail().withMessage('Format email tidak valid')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password harus diisi')
        .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    
    validate
];

/**
 * Login validation rules
 */
const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email harus diisi')
        .isEmail().withMessage('Format email tidak valid')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password harus diisi'),
    
    validate
];

/**
 * Transaction validation rules
 */
const transactionValidation = [
    body('wallet_id')
        .notEmpty().withMessage('Dompet harus dipilih')
        .isInt({ min: 1 }).withMessage('ID dompet tidak valid'),
    
    body('category_id')
        .notEmpty().withMessage('Kategori harus dipilih')
        .isInt({ min: 1 }).withMessage('ID kategori tidak valid'),
    
    body('type')
        .notEmpty().withMessage('Tipe transaksi harus dipilih')
        .isIn(['income', 'expense']).withMessage('Tipe harus income atau expense'),
    
    body('amount')
        .notEmpty().withMessage('Jumlah harus diisi')
        .isFloat({ min: 0.01 }).withMessage('Jumlah harus lebih dari 0'),
    
    body('description')
        .trim()
        .notEmpty().withMessage('Deskripsi harus diisi')
        .isLength({ max: 255 }).withMessage('Deskripsi maksimal 255 karakter'),
    
    body('date')
        .notEmpty().withMessage('Tanggal harus diisi')
        .isDate().withMessage('Format tanggal tidak valid'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Catatan maksimal 1000 karakter'),
    
    validate
];

/**
 * Wallet validation rules
 */
const walletValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama dompet harus diisi')
        .isLength({ min: 2, max: 100 }).withMessage('Nama dompet harus antara 2-100 karakter'),
    
    body('icon')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Ikon maksimal 50 karakter'),
    
    body('color')
        .optional()
        .trim()
        .matches(/^#[0-9A-F]{6}$/i).withMessage('Format warna harus hex (#RRGGBB)'),
    
    body('balance')
        .optional()
        .isFloat({ min: 0 }).withMessage('Saldo tidak boleh negatif'),
    
    validate
];

/**
 * Category validation rules
 */
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama kategori harus diisi')
        .isLength({ min: 2, max: 100 }).withMessage('Nama kategori harus antara 2-100 karakter'),
    
    body('type')
        .notEmpty().withMessage('Tipe kategori harus dipilih')
        .isIn(['income', 'expense', 'both']).withMessage('Tipe harus income, expense, atau both'),
    
    body('icon')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Ikon maksimal 50 karakter'),
    
    body('color')
        .optional()
        .trim()
        .matches(/^#[0-9A-F]{6}$/i).withMessage('Format warna harus hex (#RRGGBB)'),
    
    validate
];

/**
 * Debt validation rules
 */
const debtValidation = [
    body('type')
        .notEmpty().withMessage('Tipe harus dipilih')
        .isIn(['hutang', 'piutang']).withMessage('Tipe harus hutang atau piutang'),
    
    body('person_name')
        .trim()
        .notEmpty().withMessage('Nama orang harus diisi')
        .isLength({ min: 2, max: 100 }).withMessage('Nama orang harus antara 2-100 karakter'),
    
    body('amount')
        .notEmpty().withMessage('Jumlah harus diisi')
        .isFloat({ min: 0.01 }).withMessage('Jumlah harus lebih dari 0'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Deskripsi maksimal 255 karakter'),
    
    body('date')
        .notEmpty().withMessage('Tanggal harus diisi')
        .isDate().withMessage('Format tanggal tidak valid'),
    
    body('due_date')
        .optional()
        .isDate().withMessage('Format tanggal jatuh tempo tidak valid'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Catatan maksimal 1000 karakter'),
    
    validate
];

/**
 * ID parameter validation
 */
const idValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID tidak valid'),
    
    validate
];

/**
 * Pagination validation
 */
const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1-100'),
    
    validate
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    transactionValidation,
    walletValidation,
    categoryValidation,
    debtValidation,
    idValidation,
    paginationValidation
};
