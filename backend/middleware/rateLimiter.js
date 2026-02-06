/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting request frequency
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Allows 100 requests per 15 minutes by default
 */
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX || 100),
    message: {
        success: false,
        message: 'Terlalu banyak permintaan, silakan coba lagi nanti'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Strict rate limiter for authentication endpoints
 * Allows only 5 requests per 15 minutes
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        message: 'Terlalu banyak percobaan login, silakan coba lagi setelah 15 menit'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful requests
});

/**
 * Moderate rate limiter for write operations
 * Allows 30 requests per 15 minutes
 */
const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Terlalu banyak operasi penulisan, silakan coba lagi nanti'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    apiLimiter,
    authLimiter,
    writeLimiter
};
