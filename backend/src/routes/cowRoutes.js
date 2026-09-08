const express = require('express');
const { getAllCows, getCowByTagId, createCow, updateCow, deleteCow } = require('../controllers/cowController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllCows);
router.get('/:tagId', getCowByTagId);
router.post('/', authenticateToken, createCow);
router.put('/:id', authenticateToken, updateCow);
router.delete('/:id', authenticateToken, deleteCow);

module.exports = router;
