const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');

/**
 * Register / Insert user directly into MongoDB
 */
const register = async (req, res, next) => {
  try {
    const { email, password, role, displayName } = req.body || {};
    const inputEmail = (email || '').trim().toLowerCase();

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
 * Authenticate user strictly against MongoDB database (zero passwords in .env)
 */
const login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body || {};
    const inputEmail = (email || username || '').trim().toLowerCase();

    if (!inputEmail || !password) {
      return ApiResponse.error(res, 'Email and password are required', 400);
    }

    // Search exclusively in MongoDB
    const user = await User.findOne({ email: inputEmail });
    if (!user) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    // Verify bcrypt password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'Account is deactivated. Please contact support.', 403);
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
 * Get profile of currently logged-in user from MongoDB
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.sub).select('-password');

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
