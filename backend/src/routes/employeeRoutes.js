const express = require('express');
const { getEmployees } = require('../controllers/employeeController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getEmployees);

module.exports = router;
