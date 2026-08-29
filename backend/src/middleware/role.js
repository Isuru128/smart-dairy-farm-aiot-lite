const ApiResponse = require('../utils/apiResponse');

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required', 401);
    }

    if (req.user.role === 'super-admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
}

module.exports = {
  authorizeRoles,
};
