const express = require('express');
const { getLiveTelemetry, ingestSensorData, getSensorHistory } = require('../controllers/sensorController');

const router = express.Router();

router.get('/live', getLiveTelemetry);
router.get('/history', getSensorHistory);
router.post('/telemetry', ingestSensorData);

module.exports = router;
