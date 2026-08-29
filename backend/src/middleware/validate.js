const ApiResponse = require('../utils/apiResponse');

function validateBody(requiredFields = []) {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');
    if (missing.length > 0) {
      return ApiResponse.error(
        res,
        `Missing required fields: ${missing.join(', ')}`,
        400
      );
    }
    next();
  };
}

module.exports = {
  validateBody,
};
