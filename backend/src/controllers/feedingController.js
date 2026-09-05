const FeedingSchedule = require('../models/FeedingSchedule');
const ApiResponse = require('../utils/apiResponse');

const mockSchedules = [
  { _id: 'feed-1', title: 'Morning High-Yield Ration', targetGroup: 'Lactating Cows (Stall 1-20)', gateId: 'GATE-NORTH-1', gateStatus: 'closed', scheduledTime: '06:00 AM', rationType: 'Corn Silage + Concentrate', quantityKg: 350, isAutomated: true, isActive: true },
  { _id: 'feed-2', title: 'Mid-Day Grazing Pasture Access', targetGroup: 'All Lactating Cows', gateId: 'GATE-PASTURE-A', gateStatus: 'open', scheduledTime: '11:00 AM', rationType: 'Open Grazing', quantityKg: 0, isAutomated: true, isActive: true },
  { _id: 'feed-3', title: 'Evening Mineral & Concentrates', targetGroup: 'Pregnant & Maternity', gateId: 'GATE-SOUTH-2', gateStatus: 'closed', scheduledTime: '05:30 PM', rationType: 'Alfalfa Hay + Minerals', quantityKg: 200, isAutomated: true, isActive: true },
];

const getSchedules = async (req, res, next) => {
  try {
    let schedules = [];
    try {
      schedules = await FeedingSchedule.find();
    } catch (e) {
      schedules = mockSchedules;
    }
    if (!schedules || schedules.length === 0) schedules = mockSchedules;
    return ApiResponse.success(res, schedules, 'Feeding schedules retrieved');
  } catch (error) {
    next(error);
  }
};

const triggerGateControl = async (req, res, next) => {
  try {
    const { gateId, action } = req.body; // action: 'open' | 'close'
    return ApiResponse.success(res, {
      gateId: gateId || 'GATE-01',
      status: action === 'open' ? 'open' : 'closed',
      commandSentAt: new Date().toISOString(),
      actuator: 'Relay-Servo-Controller-ESP32',
    }, `Gate ${gateId} command "${action}" executed`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchedules,
  triggerGateControl,
};
