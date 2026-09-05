const express = require('express');
const { predictYield, analyzeDiseaseRisk, getFeedRecommendation } = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/predict-yield', authenticateToken, predictYield);
router.post('/disease-risk', authenticateToken, analyzeDiseaseRisk);
router.get('/feed-optimization', authenticateToken, getFeedRecommendation);

module.exports = router;
