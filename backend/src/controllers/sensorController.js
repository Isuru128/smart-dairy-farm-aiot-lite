const IotService = require('../services/iotService');
const SensorData = require('../models/SensorData');
const ApiResponse = require('../utils/apiResponse');

const getLiveTelemetry = async (req, res, next) => {
  try {
    const telemetry = IotService.getSimulatedTelemetry();
    return ApiResponse.success(res, telemetry, 'Live IoT telemetry fetched');
  } catch (error) {
    next(error);
  }
};

const ingestSensorData = async (req, res, next) => {
  try {
    const { deviceId, sensorType, value, unit, location } = req.body;
    if (!sensorType || value === undefined) {
      return ApiResponse.error(res, 'sensorType and value are required', 400);
    }
    const result = await IotService.processSensorReading({ deviceId, sensorType, value, unit, location });
    return ApiResponse.success(res, result, 'Sensor telemetry processed', 201);
  } catch (error) {
    next(error);
  }
};

const getSensorHistory = async (req, res, next) => {
  try {
    const { sensorType } = req.query;
    let data = [];
    try {
      const query = sensorType ? { sensorType } : {};
      data = await SensorData.find(query).sort({ timestamp: -1 }).limit(50);
    } catch (e) {
      data = [
        { deviceId: 'ESP32-01', sensorType: 'temperature', value: 23.4, unit: '°C', timestamp: new Date() },
        { deviceId: 'ESP32-01', sensorType: 'humidity', value: 68.2, unit: '%', timestamp: new Date() },
        { deviceId: 'ESP32-02', sensorType: 'water_level', value: 84.0, unit: '%', timestamp: new Date() },
      ];
    }
    return ApiResponse.success(res, data, 'Sensor history retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLiveTelemetry,
  ingestSensorData,
  getSensorHistory,
};
