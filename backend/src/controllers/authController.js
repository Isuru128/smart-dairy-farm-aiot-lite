const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return ApiResponse.error(res, 'Username and password are required', 400);
    }

    const user = User.findByUsername ? User.findByUsername(username) : null;
    if (!user || user.password !== password) {
      return ApiResponse.error(res, 'Invalid username or password', 401);
    }

    const tokenPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = generateToken(tokenPayload);

    return ApiResponse.success(res, {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
      },
    }, 'Authentication successful');
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = User.findById ? User.findById(req.user.sub) : null;
    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    return ApiResponse.success(res, {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
    }, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getProfile,
};
