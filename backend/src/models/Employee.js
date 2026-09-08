const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ['Admin', 'Farm Manager', 'Veterinarian', 'Employee', 'Financial Officer'],
      default: 'Employee',
    },
    shift: {
      type: String,
      enum: ['Morning (05:00 - 13:00)', 'Day (08:00 - 16:00)', 'Evening (13:00 - 21:00)', 'Night (21:00 - 05:00)'],
      default: 'Morning (05:00 - 13:00)',
    },
    status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
    assignedTasks: [
      {
        title: String,
        description: String,
        isCompleted: { type: Boolean, default: false },
        dueDate: Date,
      },
    ],
    joinedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', EmployeeSchema);
