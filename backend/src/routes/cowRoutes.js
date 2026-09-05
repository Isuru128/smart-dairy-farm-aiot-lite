const express = require('express');
const { getAllCows, getCowByTagId, createCow, updateCow } = require('../controllers/cowController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllCows);
router.get('/:tagId', getCowByTagId);
router.post('/', authenticateToken, createCow);
router.put('/:id', authenticateToken, updateCow);

module.exports = router;
