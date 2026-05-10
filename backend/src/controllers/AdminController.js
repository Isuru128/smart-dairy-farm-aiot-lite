const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const login = async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const user = User.findByUsername(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  const tokenPayload = {
    sub: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = generateToken(tokenPayload);

  return res.json({
    success: true,
    accessToken,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
    },
  });
};

const getProfile = async (req, res) => {
  const user = User.findById(req.user.sub);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
    },
  });
};

module.exports = {
  login,
  getProfile,
};
