/**
 * Report Routes
 * Analytics and reporting endpoints
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET routes
router.get('/summary', reportController.getSummary);
router.get('/by-category', reportController.byCategory);
router.get('/by-wallet', reportController.byWallet);
router.get('/monthly', reportController.monthly);
router.get('/expense-chart', reportController.expenseChart);
router.get('/income-chart', reportController.incomeChart);

module.exports = router;
