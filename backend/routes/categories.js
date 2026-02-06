/**
 * Category Routes
 * CRUD operations for categories
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { categoryValidation, idValidation } = require('../middleware/validator');
const { writeLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(authenticate);

// GET routes
router.get('/', categoryController.getAll);
router.get('/:id', idValidation, categoryController.getById);

// POST routes (rate limited)
router.post('/', writeLimiter, categoryValidation, categoryController.create);

// PUT routes (rate limited)
router.put('/:id', writeLimiter, idValidation, categoryValidation, categoryController.update);

// DELETE routes (rate limited)
router.delete('/:id', writeLimiter, idValidation, categoryController.delete);

module.exports = router;
