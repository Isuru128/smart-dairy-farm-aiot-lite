const express = require('express');
const {
  getMilkLogs,
  recordMilkProduction,
  updateMilkProduction,
  deleteMilkProduction,
  getProductionAnalytics,
} = require('../controllers/milkController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getMilkLogs);
router.get('/analytics', getProductionAnalytics);
router.post('/record', authenticateToken, recordMilkProduction);
router.post('/', authenticateToken, recordMilkProduction);
router.put('/:id', authenticateToken, updateMilkProduction);
router.delete('/:id', authenticateToken, deleteMilkProduction);

module.exports = router;
