/**
 * Global Error Handler Middleware
 * Catches and handles all errors in the application
 */

const response = require('../utils/response');

/**
 * Error handling middleware
 * Must be placed after all routes
 */
function errorHandler(err, req, res, next) {
    // Log error for debugging
    console.error('Error:', err);
    
    // Handle specific error types
    
    // MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
        return response.error(res, 'Data sudah ada dalam database', 409);
    }
    
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return response.error(res, 'Data yang direferensikan tidak ditemukan', 404);
    }
    
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return response.error(res, 'Data tidak dapat dihapus karena masih digunakan', 409);
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return response.unauthorized(res, 'Token tidak valid');
    }
    
    if (err.name === 'TokenExpiredError') {
        return response.unauthorized(res, 'Token sudah kadaluarsa');
    }
    
    // Validation errors
    if (err.name === 'ValidationError') {
        return response.validationError(res, err.errors);
    }
    
    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan internal server';
    
    return response.error(res, message, statusCode);
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
    return response.notFound(res, `Endpoint ${req.method} ${req.path} tidak ditemukan`);
}

module.exports = {
    errorHandler,
    notFoundHandler
};
