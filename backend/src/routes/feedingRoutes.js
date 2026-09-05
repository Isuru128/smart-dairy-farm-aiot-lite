const express = require('express');
const { getSchedules, triggerGateControl } = require('../controllers/feedingController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/schedules', getSchedules);
router.post('/gate-control', authenticateToken, triggerGateControl);

module.exports = router;
