const mongoose = require('mongoose');

const FinancialRecordSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: {
      type: String,
      enum: ['Milk Sales', 'Cattle Sales', 'Feed Purchase', 'Veterinary & Meds', 'Equipment & Utilities', 'Salaries', 'Maintenance', 'Other'],
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
    referenceInvoice: { type: String },
    recordedBy: { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinancialRecord', FinancialRecordSchema);
