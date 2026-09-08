const express = require('express');
const {
  getInventoryList,
  createInventoryItem,
  updateInventoryItem,
  updateStock,
  deleteInventoryItem,
} = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getInventoryList);
router.post('/', authenticateToken, createInventoryItem);
router.put('/:id', authenticateToken, updateInventoryItem);
router.put('/:id/stock', authenticateToken, updateStock);
router.delete('/:id', authenticateToken, deleteInventoryItem);

module.exports = router;
