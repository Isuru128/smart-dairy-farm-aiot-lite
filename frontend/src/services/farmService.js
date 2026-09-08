import api from './api';

export const farmService = {
  // Cows / Livestock
  getCows: () => api.get('/cows'),
  getCowDetails: (tagId) => api.get(`/cows/${tagId}`),
  createCow: (data) => api.post('/cows', data),
  updateCow: (id, data) => api.put(`/cows/${id}`, data),
  deleteCow: (id) => api.delete(`/cows/${id}`),

  // Milk
  getMilkLogs: () => api.get('/milk'),
  getMilkAnalytics: () => api.get('/milk/analytics'),
  recordMilk: (data) => api.post('/milk/record', data),

  // Sensors & IoT
  getLiveSensors: () => api.get('/sensors/live'),
  getSensorHistory: (type) => api.get(`/sensors/history?sensorType=${type || ''}`),

  // Feeding
  getFeedingSchedules: () => api.get('/feeding/schedules'),
  controlGate: (gateId, action) => api.post('/feeding/gate-control', { gateId, action }),

  // Inventory
  getInventory: () => api.get('/inventory'),
  createInventoryItem: (data) => api.post('/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/inventory/${id}`, data),
  updateInventoryStock: (id, quantity) => api.put(`/inventory/${id}/stock`, { quantity }),
  deleteInventoryItem: (id) => api.delete(`/inventory/${id}`),

  // Employees
  getEmployees: () => api.get('/employees'),
  createEmployee: (data) => api.post('/employees', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),

  // Financials
  getFinancials: () => api.get('/finance/overview'),
  createTransaction: (data) => api.post('/finance/transactions', data),
  updateTransaction: (id, data) => api.put(`/finance/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/finance/transactions/${id}`),

  // Alerts
  getAlerts: () => api.get('/alerts'),
  resolveAlert: (id) => api.put(`/alerts/${id}/resolve`),

  // AI predictions
  predictYield: (data) => api.post('/ai/predict-yield', data),
  analyzeDiseaseRisk: (data) => api.post('/ai/disease-risk', data),
  getFeedOptimization: () => api.get('/ai/feed-optimization'),
};
