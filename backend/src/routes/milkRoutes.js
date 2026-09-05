const express = require('express');
const { getMilkLogs, recordMilkProduction, getProductionAnalytics } = require('../controllers/milkController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getMilkLogs);
router.get('/analytics', getProductionAnalytics);
router.post('/record', authenticateToken, recordMilkProduction);

module.exports = router;
