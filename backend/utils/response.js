/**
 * Standardized API Response Utility
 * Provides consistent response format across all endpoints
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
function success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
}

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 400)
 * @param {*} errors - Additional error details
 */
function error(res, message = 'Error occurred', statusCode = 400, errors = null) {
    const response = {
        success: false,
        message
    };
    
    if (errors) {
        response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
}

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} total - Total number of items
 * @param {String} message - Success message
 */
function paginated(res, data, page, limit, total, message = 'Success') {
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    });
}

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {String} message - Success message
 */
function created(res, data, message = 'Resource created successfully') {
    return success(res, data, message, 201);
}

/**
 * Send no content response
 * @param {Object} res - Express response object
 */
function noContent(res) {
    return res.status(204).send();
}

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
function unauthorized(res, message = 'Unauthorized access') {
    return error(res, message, 401);
}

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
function forbidden(res, message = 'Forbidden') {
    return error(res, message, 403);
}

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
function notFound(res, message = 'Resource not found') {
    return error(res, message, 404);
}

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {*} errors - Validation errors
 */
function validationError(res, errors) {
    return error(res, 'Validation failed', 422, errors);
}

/**
 * Send internal server error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
function serverError(res, message = 'Internal server error') {
    return error(res, message, 500);
}

module.exports = {
    success,
    error,
    paginated,
    created,
    noContent,
    unauthorized,
    forbidden,
    notFound,
    validationError,
    serverError
};
