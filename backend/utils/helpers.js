/**
 * Helper Utilities
 * Common helper functions used across the application
 */

const bcrypt = require('bcryptjs');

/**
 * Hash password using bcrypt
 * @param {String} password - Plain text password
 * @returns {Promise<String>} Hashed password
 */
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 * @param {String} password - Plain text password
 * @param {String} hash - Hashed password
 * @returns {Promise<Boolean>} True if passwords match
 */
async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

/**
 * Calculate pagination offset
 * @param {Number} page - Page number (1-indexed)
 * @param {Number} limit - Items per page
 * @returns {Number} Offset value
 */
function calculateOffset(page, limit) {
    return (page - 1) * limit;
}

/**
 * Validate email format
 * @param {String} email - Email address
 * @returns {Boolean} True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize user input (basic XSS prevention)
 * @param {String} input - User input
 * @returns {String} Sanitized input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Format date to MySQL date format
 * @param {Date|String} date - Date object or string
 * @returns {String} Formatted date (YYYY-MM-DD)
 */
function formatDateForDB(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format datetime to MySQL datetime format
 * @param {Date|String} date - Date object or string
 * @returns {String} Formatted datetime (YYYY-MM-DD HH:MM:SS)
 */
function formatDateTimeForDB(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Generate random string
 * @param {Number} length - Length of string
 * @returns {String} Random string
 */
function generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Check if date is overdue
 * @param {Date|String} dueDate - Due date
 * @returns {Boolean} True if overdue
 */
function isOverdue(dueDate) {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return due < now;
}

/**
 * Parse pagination parameters
 * @param {Object} query - Request query object
 * @returns {Object} Parsed pagination params
 */
function parsePaginationParams(query) {
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100); // Max 100 items per page
    const offset = calculateOffset(page, limit);
    
    return { page, limit, offset };
}

/**
 * Remove sensitive fields from user object
 * @param {Object} user - User object
 * @returns {Object} User object without sensitive fields
 */
function sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
}

/**
 * Build SQL WHERE clause from filters
 * @param {Object} filters - Filter object
 * @returns {Object} { where: String, params: Array }
 */
function buildWhereClause(filters) {
    const conditions = [];
    const params = [];
    
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            conditions.push(`${key} = ?`);
            params.push(value);
        }
    });
    
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { where, params };
}

module.exports = {
    hashPassword,
    comparePassword,
    calculateOffset,
    isValidEmail,
    sanitizeInput,
    formatDateForDB,
    formatDateTimeForDB,
    generateRandomString,
    isOverdue,
    parsePaginationParams,
    sanitizeUser,
    buildWhereClause
};
