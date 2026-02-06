/**
 * JWT Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { query } = require('../config/database');
const { unauthorized } = require('../utils/response');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Token tidak ditemukan');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.secret, {
        algorithms: [jwtConfig.algorithm],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return unauthorized(res, 'Token telah kadaluarsa');
      }
      if (error.name === 'JsonWebTokenError') {
        return unauthorized(res, 'Token tidak valid');
      }
      throw error;
    }

    // Check if session exists and is valid
    const [session] = await query(
      'SELECT * FROM sessions WHERE token = ? AND user_id = ? AND expires_at > NOW()',
      [token, decoded.userId]
    );

    if (!session) {
      return unauthorized(res, 'Sesi tidak valid atau telah kadaluarsa');
    }

    // Get user data
    const [user] = await query(
      'SELECT id, name, email, avatar_url, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return unauthorized(res, 'User tidak ditemukan');
    }

    if (!user.is_active) {
      return unauthorized(res, 'Akun Anda telah dinonaktifkan');
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    req.sessionId = session.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return unauthorized(res, 'Autentikasi gagal');
  }
};

/**
 * Check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return unauthorized(res, 'Akses ditolak. Membutuhkan hak admin');
  }
  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    const [user] = await query(
      'SELECT id, name, email, avatar_url, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (user && user.is_active) {
      req.user = user;
      req.token = token;
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth
};
