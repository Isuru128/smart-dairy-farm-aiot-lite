const express = require('express');
const { getFinancialOverview } = require('../controllers/financeController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', authenticateToken, getFinancialOverview);

module.exports = router;
