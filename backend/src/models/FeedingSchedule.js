const mongoose = require('mongoose');

const FeedingScheduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    targetGroup: { type: String, default: 'High Yield Lactating' },
    gateId: { type: String, default: 'GATE-01' },
    gateStatus: { type: String, enum: ['open', 'closed', 'maintenance'], default: 'closed' },
    scheduledTime: { type: String, required: true }, // e.g. "06:30 AM"
    rationType: { type: String, required: true }, // Silage, Concentrate, Hay
    quantityKg: { type: Number, required: true },
    isAutomated: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    lastTriggeredAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeedingSchedule', FeedingScheduleSchema);
