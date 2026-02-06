/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const { verifyToken } = require('../config/jwt');
const { pool } = require('../config/database');
const response = require('../utils/response');

/**
 * Middleware to verify JWT token and authenticate user
 */
async function authenticate(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return response.unauthorized(res, 'Token tidak ditemukan');
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Verify token
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return response.unauthorized(res, 'Token tidak valid atau sudah kadaluarsa');
        }
        
        // Check if session exists and is valid
        const [sessions] = await pool.query(
            'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
            [token]
        );
        
        if (sessions.length === 0) {
            return response.unauthorized(res, 'Sesi tidak valid atau sudah kadaluarsa');
        }
        
        // Get user from database
        const [users] = await pool.query(
            'SELECT id, name, email, avatar_url, role, is_active FROM users WHERE id = ?',
            [decoded.userId]
        );
        
        if (users.length === 0) {
            return response.unauthorized(res, 'User tidak ditemukan');
        }
        
        const user = users[0];
        
        // Check if user is active
        if (!user.is_active) {
            return response.forbidden(res, 'Akun Anda telah dinonaktifkan');
        }
        
        // Attach user to request object
        req.user = user;
        req.token = token;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return response.serverError(res, 'Terjadi kesalahan saat autentikasi');
    }
}

/**
 * Middleware to check if user is admin
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return response.forbidden(res, 'Hanya admin yang dapat mengakses resource ini');
    }
    next();
}

/**
 * Optional authentication - doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        
        const token = authHeader.substring(7);
        
        try {
            const decoded = verifyToken(token);
            
            const [users] = await pool.query(
                'SELECT id, name, email, avatar_url, role, is_active FROM users WHERE id = ?',
                [decoded.userId]
            );
            
            if (users.length > 0 && users[0].is_active) {
                req.user = users[0];
                req.token = token;
            }
        } catch (error) {
            // Token invalid, but that's okay for optional auth
        }
        
        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next();
    }
}

module.exports = {
    authenticate,
    requireAdmin,
    optionalAuth
};
