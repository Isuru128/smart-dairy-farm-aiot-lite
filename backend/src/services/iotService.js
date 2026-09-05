const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const logger = require('../utils/logger');

class IotService {
  /**
   * Process incoming sensor telemetry payload
   */
  static async processSensorReading(payload) {
    const { deviceId, sensorType, value, unit, location } = payload;

    // Check thresholds for warnings
    let isWarning = false;
    if (sensorType === 'temperature' && (value > 30 || value < 10)) {
      isWarning = true;
    } else if (sensorType === 'humidity' && (value > 85 || value < 40)) {
      isWarning = true;
    } else if (sensorType === 'water_level' && value < 20) {
      isWarning = true;
    }

    const sensorEntry = new SensorData({
      deviceId: deviceId || 'ESP32_BARN_DEFAULT',
      sensorType,
      value,
      unit: unit || 'units',
      location: location || 'Main Barn',
      isWarning,
    });

    try {
      if (sensorEntry.schema && sensorEntry.save) {
        await sensorEntry.save();
      }
    } catch (e) {
      logger.warn('Sensor data persistence warning (DB may be in memory/disconnected):', e.message);
    }

    if (isWarning) {
      try {
        await Alert.create({
          title: `Sensor Anomaly: ${sensorType.toUpperCase()}`,
          message: `${sensorType} reached warning level: ${value} ${unit} at ${location || 'Main Barn'}`,
          category: 'Sensor Anomaly',
          severity: 'high',
        });
      } catch (err) {
        logger.warn('Alert creation skipped:', err.message);
      }
    }

    return sensorEntry;
  }

  /**
   * Get simulated real-time telemetry feed if hardware is offline
   */
  static getSimulatedTelemetry() {
    return {
      barnTemperature: (22 + Math.random() * 4).toFixed(1),
      barnHumidity: (65 + Math.random() * 8).toFixed(1),
      waterTankLevel: (78 + Math.random() * 5).toFixed(0),
      airQualityIndex: (42 + Math.random() * 6).toFixed(0),
      gateStatus: 'Closed (Automated)',
      connectedSensors: 14,
      lastSync: new Date().toISOString(),
    };
  }
}

module.exports = IotService;
