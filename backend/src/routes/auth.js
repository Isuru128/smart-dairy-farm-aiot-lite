const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register/Insert user into MongoDB
router.post('/register', register);
router.post('/create-user', register);

// Login
router.post('/login', login);

// Profile
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
