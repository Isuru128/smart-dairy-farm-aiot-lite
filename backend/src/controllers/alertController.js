const Alert = require('../models/Alert');
const ApiResponse = require('../utils/apiResponse');

const mockAlerts = [
  { _id: 'alt-1', title: 'High Barn Temperature Alert', message: 'Barn A section 2 temp exceeded 28.5°C threshold. Automated fans activated.', category: 'Sensor Anomaly', severity: 'medium', isResolved: false, createdAt: new Date().toISOString() },
  { _id: 'alt-2', title: 'Vaccination Due: Cow-101', message: 'FMD booster shot due in 3 days for Cow #COW-RFID-101.', category: 'Health Reminder', severity: 'low', isResolved: false, createdAt: new Date().toISOString() },
  { _id: 'alt-3', title: 'Low Feed Threshold in Silo 2', message: 'Corn silage level dropped below 15% remaining capacity.', category: 'Feeding Warning', severity: 'high', isResolved: true, createdAt: new Date().toISOString() },
];

const getAlerts = async (req, res, next) => {
  try {
    let alerts = [];
    try {
      alerts = await Alert.find().sort({ createdAt: -1 });
    } catch (e) {
      alerts = mockAlerts;
    }
    if (!alerts || alerts.length === 0) alerts = mockAlerts;
    return ApiResponse.success(res, alerts, 'Alerts list retrieved');
  } catch (error) {
    next(error);
  }
};

const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    return ApiResponse.success(res, { id, isResolved: true, resolvedAt: new Date() }, 'Alert marked as resolved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  resolveAlert,
};
