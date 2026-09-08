const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');

/**
 * Register / Insert user into MongoDB via Email & Password
 */
const register = async (req, res, next) => {
  try {
    const { email, username, password, role, displayName } = req.body || {};
    const inputEmail = (email || username || '').trim().toLowerCase();

    if (!inputEmail || !password) {
      return ApiResponse.error(res, 'Email and password are required', 400);
    }

    if (password.length < 6) {
      return ApiResponse.error(res, 'Password must be at least 6 characters long', 400);
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email: inputEmail });
    if (existingUser) {
      return ApiResponse.error(res, `User with email "${inputEmail}" already exists`, 409);
    }

    // Create user document in MongoDB (pre-save hook hashes password with bcrypt)
    const newUser = await User.create({
      email: inputEmail,
      password,
      role: role || 'Admin',
      displayName: displayName || 'Administrator',
    });

    return ApiResponse.success(
      res,
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        displayName: newUser.displayName,
        createdAt: newUser.createdAt,
      },
      'Admin user created successfully in MongoDB',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user via Email and Password
 */
const login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body || {};
    const inputEmail = (email || username || '').trim().toLowerCase();

    if (!inputEmail || !password) {
      return ApiResponse.error(res, 'Email and password are required', 400);
    }

    // 1. Search in MongoDB User collection by email
    let user = await User.findOne({ email: inputEmail });

    // 2. Fallback to environment credentials if DB user not yet created
    const envAdminEmail = (process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || '').trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD;

    if (!user && envAdminEmail && envAdminPassword) {
      if (inputEmail === envAdminEmail && password === envAdminPassword) {
        user = {
          _id: 'env-admin',
          email: envAdminEmail,
          role: 'Admin',
          displayName: process.env.ADMIN_DISPLAY_NAME || 'Administrator',
          isEnvFallback: true,
        };
      }
    }

    if (!user) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    // Verify password
    if (user.comparePassword) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return ApiResponse.error(res, 'Invalid email or password', 401);
      }
    } else if (!user.isEnvFallback && user.password !== password) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    const tokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateToken(tokenPayload);

    return ApiResponse.success(
      res,
      {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          displayName: user.displayName,
        },
      },
      'Authentication successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get profile of currently logged-in user
 */
const getProfile = async (req, res, next) => {
  try {
    let user = null;

    if (req.user?.sub === 'env-admin') {
      const envAdminEmail = (process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || '').trim().toLowerCase();
      user = {
        _id: 'env-admin',
        email: envAdminEmail,
        role: 'Admin',
        displayName: process.env.ADMIN_DISPLAY_NAME || 'Administrator',
      };
    } else {
      user = await User.findById(req.user?.sub).select('-password');
    }

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    return ApiResponse.success(
      res,
      {
        id: user._id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
      'Profile retrieved'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
