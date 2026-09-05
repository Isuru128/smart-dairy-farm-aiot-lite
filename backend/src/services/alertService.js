const Alert = require('../models/Alert');
const logger = require('../utils/logger');

class AlertService {
  static async createAlert({ title, message, category, severity, metaData }) {
    try {
      const alert = new Alert({
        title,
        message,
        category: category || 'System',
        severity: severity || 'medium',
        metaData,
      });

      if (alert.save) {
        await alert.save();
      }
      logger.info(`Alert Created: [${severity}] ${title}`);
      return alert;
    } catch (error) {
      logger.error('Failed to create alert:', error.message);
      return null;
    }
  }

  static async getActiveAlerts() {
    try {
      return await Alert.find({ isResolved: false }).sort({ createdAt: -1 });
    } catch (e) {
      return [];
    }
  }
}

module.exports = AlertService;
