const express = require('express');
const {
  getFinancialOverview,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/financeController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', authenticateToken, getFinancialOverview);
router.post('/transactions', authenticateToken, createTransaction);
router.put('/transactions/:id', authenticateToken, updateTransaction);
router.delete('/transactions/:id', authenticateToken, deleteTransaction);

module.exports = router;
