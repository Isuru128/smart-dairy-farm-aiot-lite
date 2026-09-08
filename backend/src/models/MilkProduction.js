const mongoose = require('mongoose');

const MilkProductionSchema = new mongoose.Schema(
  {
    cowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cow', required: false, index: true },
    cowTagId: { type: String, required: true, index: true },
    session: { type: String, enum: ['Morning', 'Evening', 'Special'], required: true },
    quantityLiters: { type: Number, required: true },
    fatPercentage: { type: Number, default: 3.8 },
    proteinPercentage: { type: Number, default: 3.2 },
    temperatureCelsius: { type: Number, default: 37.0 },
    recordedBy: { type: String, default: 'Milking Operator' },
    date: { type: Date, default: Date.now, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MilkProduction', MilkProductionSchema);
