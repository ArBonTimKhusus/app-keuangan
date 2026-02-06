/**
 * Helper Utility Functions
 */

const crypto = require('crypto');

/**
 * Generate a unique ID using timestamp and random string
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Generate a random token
 * @param {Number} length - Token length (default: 32)
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date|String} date - Date object or string
 */
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date to Indonesian locale
 * @param {Date|String} date - Date object or string
 */
const formatDateIndonesian = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Calculate date range based on period
 * @param {String} period - 'today', 'week', 'month', 'year'
 */
const getDateRange = (period) => {
  const today = new Date();
  const start = new Date();
  let end = new Date();

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(today.getDate() - today.getDay());
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(today.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
  }

  return { start: formatDate(start), end: formatDate(end) };
};

/**
 * Validate email format
 * @param {String} email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize string input
 * @param {String} str
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Paginate results
 * @param {Number} page - Current page (1-indexed)
 * @param {Number} limit - Items per page
 */
const getPagination = (page = 1, limit = 10) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  return {
    limit: parseInt(limit),
    offset: offset >= 0 ? offset : 0
  };
};

/**
 * Build pagination metadata
 * @param {Number} total - Total items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total: parseInt(total),
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

/**
 * Sleep/delay function
 * @param {Number} ms - Milliseconds to sleep
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if date is overdue
 * @param {Date|String} dueDate
 */
const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

module.exports = {
  generateId,
  generateToken,
  formatDate,
  formatDateIndonesian,
  getDateRange,
  isValidEmail,
  sanitizeString,
  getPagination,
  buildPaginationMeta,
  sleep,
  isOverdue
};
