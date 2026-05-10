const express = require('express');
const { login, getProfile } = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile (protected)
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
