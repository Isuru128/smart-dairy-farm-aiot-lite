const mongoose = require('mongoose');

const milkProductionSchema = new mongoose.Schema({
  cowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cow',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  session: {
    type: String,
    enum: ['morning', 'evening'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  quality: {
    fat: {
      type: Number,
      min: 0,
      max: 100
    },
    protein: {
      type: Number,
      min: 0,
      max: 100
    },
    lactose: {
      type: Number,
      min: 0,
      max: 100
    },
    somaticCellCount: {
      type: Number,
      min: 0
    },
    bacterialCount: {
      type: Number,
      min: 0
    }
  },
  temperature: {
    type: Number,
    min: 0,
    max: 50
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  milkingMachineId: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // in minutes
    min: 0
  },
  notes: String,
  isAutomated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
milkProductionSchema.index({ cowId: 1, date: -1 });
milkProductionSchema.index({ date: -1, session: 1 });
milkProductionSchema.index({ recordedBy: 1 });

// Virtual for total daily production (calculated on query)
milkProductionSchema.statics.getDailyTotal = async function(cowId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await this.aggregate([
    {
      $match: {
        cowId: mongoose.Types.ObjectId(cowId),
        date: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: '$quantity' },
        morningQuantity: {
          $sum: {
            $cond: [{ $eq: ['$session', 'morning'] }, '$quantity', 0]
          }
        },
        eveningQuantity: {
          $sum: {
            $cond: [{ $eq: ['$session', 'evening'] }, '$quantity', 0]
          }
        }
      }
    }
  ]);

  return result[0] || { totalQuantity: 0, morningQuantity: 0, eveningQuantity: 0 };
};

module.exports = mongoose.model('MilkProduction', milkProductionSchema);