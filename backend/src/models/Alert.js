const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ['Sensor Anomaly', 'Low Production', 'Health Reminder', 'Feeding Warning', 'System'],
      default: 'System',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
    metaData: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', AlertSchema);
