/**
 * JWT Configuration
 * Handles JWT token generation and verification
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Generate access token
 * @param {Object} payload - User data to encode in token
 * @returns {String} JWT token
 */
function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRY
    });
}

/**
 * Generate refresh token
 * @param {Object} payload - User data to encode in token
 * @returns {String} JWT refresh token
 */
function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRY
    });
}

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Decode token without verification (for expired token inspection)
 * @param {String} token - JWT token
 * @returns {Object} Decoded payload
 */
function decodeToken(token) {
    return jwt.decode(token);
}

module.exports = {
    JWT_SECRET,
    JWT_EXPIRY,
    JWT_REFRESH_EXPIRY,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    decodeToken
};
