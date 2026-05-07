const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Cow = require('../models/Cow');
const MilkProduction = require('../models/MilkProduction');
const { authenticateToken, authorizePermissions } = require('../middleware/auth');

const router = express.Router();

// Get all cows with pagination and filtering
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['active', 'sold', 'deceased', 'quarantined']),
  query('breed').optional().isString(),
  query('healthStatus').optional().isIn(['healthy', 'sick', 'recovering', 'critical']),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.breed) filter.breed = req.query.breed;
    if (req.query.healthStatus) filter.healthStatus = req.query.healthStatus;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { rfidTag: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const cows = await Cow.find(filter)
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Cow.countDocuments(filter);

    res.json({
      cows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get cows error:', error);
    res.status(500).json({ error: 'Failed to fetch cows' });
  }
});

// Get single cow by ID
router.get('/:id', authenticateToken, [
  param('id').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const cow = await Cow.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName')
      .populate('vaccinationRecords.administeredBy', 'firstName lastName')
      .populate('healthHistory.veterinarian', 'firstName lastName')
      .populate('breedingHistory.calfId', 'name rfidTag');

    if (!cow) {
      return res.status(404).json({ error: 'Cow not found' });
    }

    res.json({ cow });
  } catch (error) {
    console.error('Get cow error:', error);
    res.status(500).json({ error: 'Failed to fetch cow' });
  }
});

// Create new cow
router.post('/', authenticateToken, authorizePermissions('write_cows'), [
  body('rfidTag').isLength({ min: 1, max: 50 }).trim(),
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('breed').isIn(['Holstein', 'Jersey', 'Guernsey', 'Ayrshire', 'Brown Swiss', 'Milking Shorthorn', 'Other']),
  body('dateOfBirth').isISO8601(),
  body('gender').isIn(['male', 'female']),
  body('currentWeight').optional().isFloat({ min: 0 }),
  body('barnLocation').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if RFID tag already exists
    const existingCow = await Cow.findOne({ rfidTag: req.body.rfidTag });
    if (existingCow) {
      return res.status(400).json({ error: 'RFID tag already exists' });
    }

    const cow = new Cow({
      ...req.body,
      assignedTo: req.user._id
    });

    await cow.save();

    // Populate assigned user
    await cow.populate('assignedTo', 'firstName lastName');

    res.status(201).json({
      message: 'Cow created successfully',
      cow
    });
  } catch (error) {
    console.error('Create cow error:', error);
    res.status(500).json({ error: 'Failed to create cow' });
  }
});

// Update cow
router.put('/:id', authenticateToken, authorizePermissions('write_cows'), [
  param('id').isMongoId(),
  body('name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('breed').optional().isIn(['Holstein', 'Jersey', 'Guernsey', 'Ayrshire', 'Brown Swiss', 'Milking Shorthorn', 'Other']),
  body('status').optional().isIn(['active', 'sold', 'deceased', 'quarantined']),
  body('healthStatus').optional().isIn(['healthy', 'sick', 'recovering', 'critical']),
  body('currentWeight').optional().isFloat({ min: 0 }),
  body('barnLocation').optional().isString(),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const cow = await Cow.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName');

    if (!cow) {
      return res.status(404).json({ error: 'Cow not found' });
    }

    res.json({
      message: 'Cow updated successfully',
      cow
    });
  } catch (error) {
    console.error('Update cow error:', error);
    res.status(500).json({ error: 'Failed to update cow' });
  }
});

// Delete cow
router.delete('/:id', authenticateToken, authorizePermissions('delete_cows'), [
  param('id').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const cow = await Cow.findByIdAndDelete(req.params.id);

    if (!cow) {
      return res.status(404).json({ error: 'Cow not found' });
    }

    res.json({ message: 'Cow deleted successfully' });
  } catch (error) {
    console.error('Delete cow error:', error);
    res.status(500).json({ error: 'Failed to delete cow' });
  }
});

// Add vaccination record
router.post('/:id/vaccinations', authenticateToken, authorizePermissions('write_cows'), [
  param('id').isMongoId(),
  body('vaccineName').isLength({ min: 1, max: 100 }).trim(),
  body('dateAdministered').isISO8601(),
  body('nextDueDate').optional().isISO8601(),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const cow = await Cow.findById(req.params.id);
    if (!cow) {
      return res.status(404).json({ error: 'Cow not found' });
    }

    const vaccinationRecord = {
      ...req.body,
      administeredBy: req.user._id
    };

    cow.vaccinationRecords.push(vaccinationRecord);
    await cow.save();

    res.status(201).json({
      message: 'Vaccination record added successfully',
      vaccination: cow.vaccinationRecords[cow.vaccinationRecords.length - 1]
    });
  } catch (error) {
    console.error('Add vaccination error:', error);
    res.status(500).json({ error: 'Failed to add vaccination record' });
  }
});

// Get cow statistics
router.get('/:id/statistics', authenticateToken, [
  param('id').isMongoId(),
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

    const cow = await Cow.findById(req.params.id);
    if (!cow) {
      return res.status(404).json({ error: 'Cow not found' });
    }

    // Get milk production statistics
    const milkStats = await MilkProduction.aggregate([
      {
        $match: {
          cowId: cow._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalProduction: { $sum: '$quantity' },
          averageProduction: { $avg: '$quantity' },
          maxProduction: { $max: '$quantity' },
          minProduction: { $min: '$quantity' },
          recordCount: { $sum: 1 }
        }
      }
    ]);

    const stats = milkStats[0] || {
      totalProduction: 0,
      averageProduction: 0,
      maxProduction: 0,
      minProduction: 0,
      recordCount: 0
    };

    res.json({
      cow: {
        id: cow._id,
        name: cow.name,
        breed: cow.breed,
        age: cow.age,
        lactationNumber: cow.lactationNumber
      },
      milkProduction: stats,
      period: {
        days,
        startDate,
        endDate: new Date()
      }
    });
  } catch (error) {
    console.error('Get cow statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch cow statistics' });
  }
});

module.exports = router;