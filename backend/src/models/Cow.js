const mongoose = require('mongoose');

const CowSchema = new mongoose.Schema(
  {
    tagId: { type: String, required: true, unique: true, index: true }, // RFID Tag
    name: { type: String, required: true },
    breed: { type: String, required: true }, // e.g. Holstein Friesian, Jersey, Sahiwal
    birthDate: { type: Date, required: true },
    gender: { type: String, enum: ['Female', 'Male'], default: 'Female' },
    weightKg: { type: Number, required: true },
    healthStatus: {
      type: String,
      enum: ['Healthy', 'Under Treatment', 'Quarantined', 'Pregnant', 'Lactating'],
      default: 'Healthy',
    },
    lactationStage: {
      type: String,
      enum: ['Early', 'Mid', 'Late', 'Dry', 'None'],
      default: 'Early',
    },
    barnLocation: { type: String, default: 'Barn A - Section 1' },
    vaccinationRecords: [
      {
        vaccineName: String,
        dateAdministered: Date,
        nextDueDate: Date,
        administeredBy: String,
        notes: String,
      },
    ],
    breedingHistory: [
      {
        inseminationDate: Date,
        sireCode: String,
        pregnancyCheckDate: Date,
        isPregnant: Boolean,
        expectedCalvingDate: Date,
      },
    ],
    dailyAverageYieldLiters: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cow', CowSchema);
