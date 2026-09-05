const FinancialRecord = require('../models/FinancialRecord');
const ApiResponse = require('../utils/apiResponse');

const getFinancialOverview = async (req, res, next) => {
  try {
    const summary = {
      currency: 'LKR',
      totalRevenueMonth: 2845000.0,
      totalExpensesMonth: 1423000.0,
      netProfitMonth: 1422000.0,
      milkSalesLiters: 24800,
      averageMilkPricePerLiter: 185.0,
      recentTransactions: [
        { type: 'income', category: 'Milk Sales', amount: 185000.0, description: 'Bulk milk delivery to Dairy Valley Co-op', date: '2026-08-25' },
        { type: 'expense', category: 'Feed Purchase', amount: 285000.0, description: 'Alfalfa Hay shipment - 5 Tons', date: '2026-08-24' },
        { type: 'expense', category: 'Veterinary & Meds', amount: 45000.0, description: 'Routine herd vaccines batch', date: '2026-08-22' },
        { type: 'income', category: 'Milk Sales', amount: 165000.0, description: 'Direct cheese processing supplier shipment', date: '2026-08-21' },
      ],
    };
    return ApiResponse.success(res, summary, 'Financial overview retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFinancialOverview,
};
