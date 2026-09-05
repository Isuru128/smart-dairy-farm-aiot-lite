const Employee = require('../models/Employee');
const ApiResponse = require('../utils/apiResponse');

const mockStaff = [
  { _id: 'emp-1', name: 'John Peterson', phone: '+1-555-0192', role: 'Farm Manager', shift: 'Morning (05:00 - 13:00)', status: 'Active', assignedTasks: [{ title: 'Inspect Barn Ventilation', isCompleted: true }] },
  { _id: 'emp-2', name: 'Dr. Sarah Mitchell', phone: '+1-555-0144', role: 'Veterinarian', shift: 'Day (08:00 - 16:00)', status: 'Active', assignedTasks: [{ title: 'Perform Ultrasound for Cow-103', isCompleted: false }] },
  { _id: 'emp-3', name: 'David Kumar', phone: '+1-555-0177', role: 'Employee', shift: 'Morning (05:00 - 13:00)', status: 'Active', assignedTasks: [{ title: 'Morning Milking Session 1', isCompleted: true }] },
];

const getEmployees = async (req, res, next) => {
  try {
    let employees = [];
    try {
      employees = await Employee.find();
    } catch (e) {
      employees = mockStaff;
    }
    if (!employees || employees.length === 0) employees = mockStaff;
    return ApiResponse.success(res, employees, 'Staff and employee list fetched');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
};
