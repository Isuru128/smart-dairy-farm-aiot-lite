const Employee = require('../models/Employee');
const ApiResponse = require('../utils/apiResponse');

let mockStaff = [
  {
    _id: 'emp-1',
    name: 'John Peterson',
    email: 'john.peterson@dairyfarm.lk',
    phone: '+94 77 123 4567',
    role: 'Farm Manager',
    shift: 'Morning (05:00 - 13:00)',
    status: 'Active',
    joinedDate: '2023-01-15',
    assignedTasks: [{ title: 'Inspect Barn Ventilation', isCompleted: true }],
  },
  {
    _id: 'emp-2',
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.vet@dairyfarm.lk',
    phone: '+94 71 987 6543',
    role: 'Veterinarian',
    shift: 'Day (08:00 - 16:00)',
    status: 'Active',
    joinedDate: '2023-04-10',
    assignedTasks: [{ title: 'Perform Ultrasound for Cow-103', isCompleted: false }],
  },
  {
    _id: 'emp-3',
    name: 'David Kumar',
    email: 'david.kumar@dairyfarm.lk',
    phone: '+94 76 555 7890',
    role: 'Employee',
    shift: 'Morning (05:00 - 13:00)',
    status: 'Active',
    joinedDate: '2023-08-01',
    assignedTasks: [{ title: 'Morning Milking Session 1', isCompleted: true }],
  },
];

const getEmployees = async (req, res, next) => {
  try {
    let employees = [];
    try {
      employees = await Employee.find().sort({ createdAt: -1 });
    } catch (e) {
      employees = mockStaff;
    }
    if (!employees || employees.length === 0) employees = mockStaff;
    return ApiResponse.success(res, employees, 'Staff and employee list fetched');
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { name, email, phone, role, shift, status, joinedDate, taskTitle } = req.body || {};

    if (!name || !phone) {
      return ApiResponse.error(res, 'Staff member name and phone number are required', 400);
    }

    const payload = {
      name: name.trim(),
      email: email ? email.trim() : undefined,
      phone: phone.trim(),
      role: role || 'Employee',
      shift: shift || 'Morning (05:00 - 13:00)',
      status: status || 'Active',
      joinedDate: joinedDate ? new Date(joinedDate) : new Date(),
      assignedTasks: taskTitle ? [{ title: taskTitle.trim(), isCompleted: false, dueDate: new Date() }] : [],
    };

    let created = null;
    try {
      created = await Employee.create(payload);
    } catch (e) {
      created = {
        _id: `emp-${Date.now()}`,
        ...payload,
        createdAt: new Date(),
      };
      mockStaff.unshift(created);
    }

    return ApiResponse.success(res, created, 'Staff member added successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.joinedDate) {
      updateData.joinedDate = new Date(updateData.joinedDate);
    }

    let updated = null;
    try {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        updated = await Employee.findByIdAndUpdate(id, updateData, { new: true });
      }
      if (!updated) {
        updated = await Employee.findOneAndUpdate({ _id: id }, updateData, { new: true });
      }
    } catch (e) {
      const idx = mockStaff.findIndex((e) => e._id === id);
      if (idx !== -1) {
        mockStaff[idx] = { ...mockStaff[idx], ...updateData, updatedAt: new Date() };
        updated = mockStaff[idx];
      }
    }

    if (!updated) {
      return ApiResponse.error(res, `Staff member with ID "${id}" not found`, 404);
    }

    return ApiResponse.success(res, updated, 'Staff member details updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    let deleted = null;

    try {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        deleted = await Employee.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await Employee.findOneAndDelete({ _id: id });
      }
    } catch (e) {
      const idx = mockStaff.findIndex((e) => e._id === id);
      if (idx !== -1) {
        deleted = mockStaff.splice(idx, 1)[0];
      }
    }

    if (!deleted) {
      return ApiResponse.error(res, `Staff member with ID "${id}" not found`, 404);
    }

    return ApiResponse.success(res, { id }, 'Staff member removed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
