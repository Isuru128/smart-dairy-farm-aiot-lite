const mongoose = require('mongoose');

const MilkProductionSchema = new mongoose.Schema(
  {
    cowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cow', required: true, index: true },
    cowTagId: { type: String, required: true },
    session: { type: String, enum: ['Morning', 'Evening', 'Special'], required: true },
    quantityLiters: { type: Number, required: true },
    fatPercentage: { type: Number, default: 3.8 },
    proteinPercentage: { type: Number, default: 3.2 },
    temperatureCelsius: { type: Number, default: 37.0 },
    recordedBy: { type: String, default: 'Automated IoT Station' },
    date: { type: Date, default: Date.now, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MilkProduction', MilkProductionSchema);
