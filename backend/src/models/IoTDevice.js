const mongoose = require('mongoose');

const iotDeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'temperature_sensor',
      'humidity_sensor',
      'water_level_sensor',
      'rfid_reader',
      'load_cell',
      'milk_flow_sensor',
      'servo_motor',
      'relay_module',
      'camera',
      'gps_tracker',
      'other'
    ]
  },
  location: {
    barn: String,
    section: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance', 'error'],
    default: 'offline'
  },
  lastSeen: {
    type: Date
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  firmwareVersion: {
    type: String
  },
  configuration: {
    type: mongoose.Schema.Types.Mixed // Flexible configuration object
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cow' // For RFID tags or cow-specific sensors
  },
  readings: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['low_battery', 'sensor_error', 'connection_lost', 'threshold_exceeded']
    },
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['repair', 'replacement', 'calibration', 'firmware_update'],
      required: true
    },
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cost: Number,
    notes: String
  }],
  thresholds: {
    temperature: {
      min: Number,
      max: Number
    },
    humidity: {
      min: Number,
      max: Number
    },
    waterLevel: {
      min: Number,
      max: Number
    }
  }
}, {
  timestamps: true
});

// Indexes
iotDeviceSchema.index({ deviceId: 1 });
iotDeviceSchema.index({ type: 1 });
iotDeviceSchema.index({ status: 1 });
iotDeviceSchema.index({ lastSeen: -1 });

// Virtual for isOnline (last seen within 5 minutes)
iotDeviceSchema.virtual('isOnline').get(function() {
  if (!this.lastSeen) return false;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.lastSeen > fiveMinutesAgo;
});

// Method to add reading
iotDeviceSchema.methods.addReading = function(data) {
  this.readings.push({ data });
  this.lastSeen = new Date();

  // Keep only last 100 readings
  if (this.readings.length > 100) {
    this.readings = this.readings.slice(-100);
  }

  return this.save();
};

// Method to check thresholds and create alerts
iotDeviceSchema.methods.checkThresholds = function(data) {
  const alerts = [];

  if (this.thresholds) {
    if (data.temperature !== undefined) {
      if (this.thresholds.temperature) {
        if (data.temperature < this.thresholds.temperature.min) {
          alerts.push({
            type: 'threshold_exceeded',
            message: `Temperature ${data.temperature}°C is below minimum threshold of ${this.thresholds.temperature.min}°C`,
            severity: 'high'
          });
        } else if (data.temperature > this.thresholds.temperature.max) {
          alerts.push({
            type: 'threshold_exceeded',
            message: `Temperature ${data.temperature}°C is above maximum threshold of ${this.thresholds.temperature.max}°C`,
            severity: 'high'
          });
        }
      }
    }

    // Similar checks for humidity, water level, etc.
  }

  if (alerts.length > 0) {
    this.alerts.push(...alerts);
  }

  return alerts.length > 0;
};

module.exports = mongoose.model('IoTDevice', iotDeviceSchema);