const express = require('express');

const authRoutes = require('./auth');
const cowRoutes = require('./cowRoutes');
const milkRoutes = require('./milkRoutes');
const sensorRoutes = require('./sensorRoutes');
const feedingRoutes = require('./feedingRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const employeeRoutes = require('./employeeRoutes');
const financeRoutes = require('./financeRoutes');
const alertRoutes = require('./alertRoutes');
const aiRoutes = require('./aiRoutes');

const router = express.Router();

// Mount API routes
router.use('/auth', authRoutes);
router.use('/cows', cowRoutes);
router.use('/milk', milkRoutes);
router.use('/sensors', sensorRoutes);
router.use('/feeding', feedingRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/employees', employeeRoutes);
router.use('/finance', financeRoutes);
router.use('/alerts', alertRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
