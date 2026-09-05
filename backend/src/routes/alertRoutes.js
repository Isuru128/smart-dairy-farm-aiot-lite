const express = require('express');
const { getAlerts, resolveAlert } = require('../controllers/alertController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAlerts);
router.put('/:id/resolve', authenticateToken, resolveAlert);

module.exports = router;
