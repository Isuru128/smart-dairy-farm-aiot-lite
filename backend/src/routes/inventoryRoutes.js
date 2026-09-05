const express = require('express');
const { getInventoryList, updateStock } = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getInventoryList);
router.put('/:id/stock', authenticateToken, updateStock);

module.exports = router;
