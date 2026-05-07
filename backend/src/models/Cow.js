const mongoose = require('mongoose');

const cowSchema = new mongoose.Schema({
  rfidTag: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  breed: {
    type: String,
    required: true,
    trim: true,
    enum: ['Holstein', 'Jersey', 'Guernsey', 'Ayrshire', 'Brown Swiss', 'Milking Shorthorn', 'Other']
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'deceased', 'quarantined'],
    default: 'active'
  },
  currentWeight: {
    type: Number,
    min: 0
  },
  averageMilkProduction: {
    type: Number,
    min: 0,
    default: 0
  },
  lactationNumber: {
    type: Number,
    min: 0,
    default: 0
  },
  lastCalvingDate: {
    type: Date
  },
  nextExpectedCalving: {
    type: Date
  },
  healthStatus: {
    type: String,
    enum: ['healthy', 'sick', 'recovering', 'critical'],
    default: 'healthy'
  },
  vaccinationRecords: [{
    vaccineName: {
      type: String,
      required: true
    },
    dateAdministered: {
      type: Date,
      required: true
    },
    nextDueDate: {
      type: Date
    },
    administeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  healthHistory: [{
    condition: {
      type: String,
      required: true
    },
    diagnosisDate: {
      type: Date,
      required: true
    },
    treatment: String,
    veterinarian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    outcome: String,
    notes: String
  }],
  breedingHistory: [{
    breedingDate: {
      type: Date,
      required: true
    },
    sireId: String,
    method: {
      type: String,
      enum: ['natural', 'artificial'],
      required: true
    },
    pregnancyConfirmed: {
      type: Boolean,
      default: false
    },
    expectedDueDate: Date,
    actualCalvingDate: Date,
    calfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow'
    },
    notes: String
  }],
  weightHistory: [{
    weight: {
      type: Number,
      required: true,
      min: 0
    },
    dateRecorded: {
      type: Date,
      required: true
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  barnLocation: {
    type: String,
    trim: true
  },
  notes: String,
  imageUrl: String
}, {
  timestamps: true
});

// Index for efficient queries
cowSchema.index({ rfidTag: 1 });
cowSchema.index({ status: 1 });
cowSchema.index({ breed: 1 });
cowSchema.index({ healthStatus: 1 });

// Virtual for age calculation
cowSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

// Virtual for days since last calving
cowSchema.virtual('daysSinceLastCalving').get(function() {
  if (!this.lastCalvingDate) return null;
  return Math.floor((Date.now() - this.lastCalvingDate) / (24 * 60 * 60 * 1000));
});

module.exports = mongoose.model('Cow', cowSchema);