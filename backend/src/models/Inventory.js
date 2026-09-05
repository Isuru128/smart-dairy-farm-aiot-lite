const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    category: {
      type: String,
      enum: ['Feed', 'Medicine', 'Equipment', 'Consumables', 'Other'],
      required: true,
    },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true }, // kg, liters, units, vials
    reorderLevel: { type: Number, required: true, default: 10 },
    costPerUnit: { type: Number, default: 0 },
    supplier: { type: String },
    expirationDate: { type: Date },
    storageLocation: { type: String, default: 'Main Store' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', InventorySchema);
