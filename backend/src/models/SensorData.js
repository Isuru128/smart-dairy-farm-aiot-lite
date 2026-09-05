const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    sensorType: {
      type: String,
      enum: ['temperature', 'humidity', 'water_level', 'air_quality', 'milk_flow'],
      required: true,
    },
    location: { type: String, default: 'Main Barn' },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    batteryLevel: { type: Number, default: 100 },
    isWarning: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SensorData', SensorDataSchema);
