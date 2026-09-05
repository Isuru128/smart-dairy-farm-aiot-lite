const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message);

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, statusCode, err.errors || null);
}

function notFoundHandler(req, res) {
  return ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
