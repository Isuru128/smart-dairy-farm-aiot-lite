const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const MilkProduction = require('../models/MilkProduction');
const Cow = require('../models/Cow');
const { authenticateToken, authorizePermissions } = require('../middleware/auth');

const router = express.Router();

// Get milk production records with filtering
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('cowId').optional().isMongoId(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('session').optional().isIn(['morning', 'evening'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.cowId) filter.cowId = req.query.cowId;
    if (req.query.session) filter.session = req.query.session;
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    const milkRecords = await MilkProduction.find(filter)
      .populate('cowId', 'name rfidTag breed')
      .populate('recordedBy', 'firstName lastName')
      .sort({ date: -1, session: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MilkProduction.countDocuments(filter);

    res.json({
      milkRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get milk records error:', error);
    res.status(500).json({ error: 'Failed to fetch milk records' });
  }
});

// Get milk production for specific cow
router.get('/cow/:cowId', authenticateToken, [
  param('cowId').isMongoId(),
  query('days').optional().isInt({ min: 1, max: 365 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const milkRecords = await MilkProduction.find({
      cowId: req.params.cowId,
      date: { $gte: startDate }
    })
    .populate('recordedBy', 'firstName lastName')
    .sort({ date: -1, session: -1 });

    // Calculate daily totals
    const dailyTotals = milkRecords.reduce((acc, record) => {
      const dateKey = record.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, total: 0, sessions: { morning: 0, evening: 0 } };
      }
      acc[dateKey].total += record.quantity;
      acc[dateKey].sessions[record.session] = record.quantity;
      return acc;
    }, {});

    const dailySummary = Object.values(dailyTotals).sort((a, b) => b.date.localeCompare(a.date));

    res.json({
      cowId: req.params.cowId,
      records: milkRecords,
      dailySummary,
      period: {
        days,
        startDate,
        endDate: new Date()
      }
    });
  } catch (error) {
    console.error('Get cow milk records error:', error);
    res.status(500).json({ error: 'Failed to fetch cow milk records' });
  }
});

// Record new milk production
router.post('/', authenticateToken, authorizePermissions('write_milk'), [
  body('cowId').isMongoId(),
  body('date').isISO8601(),
  body('session').isIn(['morning', 'evening']),
  body('quantity').isFloat({ min: 0 }),
  body('quality.fat').optional().isFloat({ min: 0, max: 100 }),
  body('quality.protein').optional().isFloat({ min: 0, max: 100 }),
  body('quality.lactose').optional().isFloat({ min: 0, max: 100 }),
  body('temperature').optional().isFloat({ min: 0, max: 50 }),
  body('milkingMachineId').optional().isString(),
  body('duration').optional().isInt({ min: 0 }),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify cow exists
    const cow = await Cow.findById(req.body.cowId);
    if (!cow) {
      return res.status(404).json({ error: 'Cow not found' });
    }

    // Check if record already exists for this cow, date, and session
    const existingRecord = await MilkProduction.findOne({
      cowId: req.body.cowId,
      date: new Date(req.body.date),
      session: req.body.session
    });

    if (existingRecord) {
      return res.status(400).json({ error: 'Milk production record already exists for this cow, date, and session' });
    }

    const milkRecord = new MilkProduction({
      ...req.body,
      recordedBy: req.user._id
    });

    await milkRecord.save();
    await milkRecord.populate('cowId', 'name rfidTag breed');
    await milkRecord.populate('recordedBy', 'firstName lastName');

    res.status(201).json({
      message: 'Milk production recorded successfully',
      milkRecord
    });
  } catch (error) {
    console.error('Record milk production error:', error);
    res.status(500).json({ error: 'Failed to record milk production' });
  }
});

// Update milk production record
router.put('/:id', authenticateToken, authorizePermissions('write_milk'), [
  param('id').isMongoId(),
  body('quantity').optional().isFloat({ min: 0 }),
  body('quality.fat').optional().isFloat({ min: 0, max: 100 }),
  body('quality.protein').optional().isFloat({ min: 0, max: 100 }),
  body('quality.lactose').optional().isFloat({ min: 0, max: 100 }),
  body('temperature').optional().isFloat({ min: 0, max: 50 }),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const milkRecord = await MilkProduction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('cowId', 'name rfidTag breed')
    .populate('recordedBy', 'firstName lastName');

    if (!milkRecord) {
      return res.status(404).json({ error: 'Milk production record not found' });
    }

    res.json({
      message: 'Milk production record updated successfully',
      milkRecord
    });
  } catch (error) {
    console.error('Update milk record error:', error);
    res.status(500).json({ error: 'Failed to update milk record' });
  }
});

// Delete milk production record
router.delete('/:id', authenticateToken, authorizePermissions('write_milk'), [
  param('id').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const milkRecord = await MilkProduction.findByIdAndDelete(req.params.id);

    if (!milkRecord) {
      return res.status(404).json({ error: 'Milk production record not found' });
    }

    res.json({ message: 'Milk production record deleted successfully' });
  } catch (error) {
    console.error('Delete milk record error:', error);
    res.status(500).json({ error: 'Failed to delete milk record' });
  }
});

// Get milk production analytics
router.get('/analytics/summary', authenticateToken, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('groupBy').optional().isIn(['day', 'week', 'month'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const groupBy = req.query.groupBy || 'day';

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            [groupBy]: groupBy === 'day' ? { $dateToString: { format: '%Y-%m-%d', date: '$date' } } :
                     groupBy === 'week' ? { $dateToString: { format: '%Y-%U', date: '$date' } } :
                     { $dateToString: { format: '%Y-%m', date: '$date' } }
          },
          totalQuantity: { $sum: '$quantity' },
          averageQuantity: { $avg: '$quantity' },
          recordCount: { $sum: 1 },
          morningTotal: {
            $sum: { $cond: [{ $eq: ['$session', 'morning'] }, '$quantity', 0] }
          },
          eveningTotal: {
            $sum: { $cond: [{ $eq: ['$session', 'evening'] }, '$quantity', 0] }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ];

    const analytics = await MilkProduction.aggregate(pipeline);

    // Get overall statistics
    const overallStats = await MilkProduction.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalProduction: { $sum: '$quantity' },
          averageProduction: { $avg: '$quantity' },
          maxProduction: { $max: '$quantity' },
          minProduction: { $min: '$quantity' },
          totalRecords: { $sum: 1 },
          uniqueCows: { $addToSet: '$cowId' }
        }
      }
    ]);

    const stats = overallStats[0] || {
      totalProduction: 0,
      averageProduction: 0,
      maxProduction: 0,
      minProduction: 0,
      totalRecords: 0,
      uniqueCows: []
    };

    res.json({
      analytics,
      summary: {
        totalProduction: stats.totalProduction,
        averageProduction: stats.averageProduction,
        maxProduction: stats.maxProduction,
        minProduction: stats.minProduction,
        totalRecords: stats.totalRecords,
        uniqueCowsCount: stats.uniqueCows.length,
        period: {
          startDate,
          endDate,
          groupBy
        }
      }
    });
  } catch (error) {
    console.error('Get milk analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch milk analytics' });
  }
});

module.exports = router;