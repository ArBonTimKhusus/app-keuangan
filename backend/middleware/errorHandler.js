/**
 * Global Error Handler Middleware
 */

const { serverError, error: errorResponse } = require('../utils/response');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MySQL errors
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return errorResponse(res, 'Data sudah ada dalam database', 409);
      case 'ER_NO_REFERENCED_ROW':
      case 'ER_NO_REFERENCED_ROW_2':
        return errorResponse(res, 'Referensi data tidak ditemukan', 400);
      case 'ER_ROW_IS_REFERENCED':
      case 'ER_ROW_IS_REFERENCED_2':
        return errorResponse(res, 'Data tidak dapat dihapus karena masih digunakan', 400);
      case 'ER_DATA_TOO_LONG':
        return errorResponse(res, 'Data terlalu panjang', 400);
      case 'ER_TRUNCATED_WRONG_VALUE':
        return errorResponse(res, 'Format data tidak valid', 400);
    }
  }

  // JWT errors (should be handled by auth middleware, but just in case)
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Token tidak valid', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token telah kadaluarsa', 401);
  }

  // Validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    return errorResponse(res, 'Validasi gagal', 400, err.array());
  }

  // Default error response
  if (err.statusCode) {
    return errorResponse(res, err.message || 'Terjadi kesalahan', err.statusCode);
  }

  // Internal server error
  return serverError(res, process.env.NODE_ENV === 'production' 
    ? 'Terjadi kesalahan pada server' 
    : err.message
  );
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  return errorResponse(res, 'Endpoint tidak ditemukan', 404);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
