import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Calendar,
  UserCheck,
  CheckSquare,
  AlertTriangle,
  Briefcase,
} from 'lucide-react';

const ROLE_OPTIONS = ['Farm Manager', 'Veterinarian', 'Employee', 'Financial Officer', 'Admin'];
const SHIFT_OPTIONS = [
  'Morning (05:00 - 13:00)',
  'Day (08:00 - 16:00)',
  'Evening (13:00 - 21:00)',
  'Night (21:00 - 05:00)',
];
const STATUS_OPTIONS = ['Active', 'On Leave', 'Inactive'];

const initialFormState = {
  name: '',
  phone: '',
  email: '',
  role: 'Employee',
  shift: 'Morning (05:00 - 13:00)',
  status: 'Active',
  joinedDate: new Date().toISOString().split('T')[0],
  taskTitle: '',
};

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [notification, setNotification] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await farmService.getEmployees();
      if (res.data) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch staff members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Open modal for Adding a staff member
  const handleOpenAdd = () => {
    setFormData({
      ...initialFormState,
      joinedDate: new Date().toISOString().split('T')[0],
    });
    setModalMode('create');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open modal for Editing a staff member
  const handleOpenEdit = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name || '',
      phone: staff.phone || '',
      email: staff.email || '',
      role: staff.role || 'Employee',
      shift: staff.shift || 'Morning (05:00 - 13:00)',
      status: staff.status || 'Active',
      joinedDate: staff.joinedDate
        ? new Date(staff.joinedDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      taskTitle: staff.assignedTasks?.[0]?.title || '',
    });
    setModalMode('edit');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open delete confirmation modal
  const handleOpenDelete = (staff) => {
    setStaffToDelete(staff);
    setIsDeleteModalOpen(true);
  };

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit Add / Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Staff member full name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Phone number is required');
      return;
    }

    try {
      setFormSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        role: formData.role,
        shift: formData.shift,
        status: formData.status,
        joinedDate: formData.joinedDate,
        taskTitle: formData.taskTitle.trim(),
      };

      if (modalMode === 'create') {
        const res = await farmService.createEmployee(payload);
        const newRecord = res.data || {
          _id: `emp-${Date.now()}`,
          ...payload,
          assignedTasks: payload.taskTitle ? [{ title: payload.taskTitle, isCompleted: false }] : [],
        };
        setEmployees((prev) => [newRecord, ...prev]);
        showNotification(`Staff member "${payload.name}" successfully added to directory.`);
      } else {
        const staffId = selectedStaff._id;
        const res = await farmService.updateEmployee(staffId, payload);
        const updatedRecord = res.data || {
          ...selectedStaff,
          ...payload,
          assignedTasks: payload.taskTitle ? [{ title: payload.taskTitle, isCompleted: false }] : [],
        };
        setEmployees((prev) =>
          prev.map((emp) => (emp._id === staffId ? updatedRecord : emp))
        );
        showNotification(`Staff member "${payload.name}" updated successfully.`);
      }

      setIsFormModalOpen(false);
    } catch (err) {
      console.error('Failed to save staff record:', err);
      setFormError(err.response?.data?.message || err.message || 'Error saving staff record.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm delete staff member
  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;
    try {
      setDeleting(true);
      await farmService.deleteEmployee(staffToDelete._id);
      setEmployees((prev) => prev.filter((emp) => emp._id !== staffToDelete._id));
      showNotification(`Staff member "${staffToDelete.name}" was removed.`);
      setIsDeleteModalOpen(false);
      setStaffToDelete(null);
    } catch (err) {
      console.error('Failed to delete staff member:', err);
      alert(err.response?.data?.message || 'Failed to delete staff member');
    } finally {
      setDeleting(false);
    }
  };

  // Filtering logic
  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      emp.name?.toLowerCase().includes(q) ||
      emp.phone?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.role?.toLowerCase().includes(q) ||
      emp.shift?.toLowerCase().includes(q);

    const matchesRole = roleFilter === 'All' || emp.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Summary counts
  const totalStaff = employees.length;
  const activeStaff = employees.filter((e) => e.status === 'Active').length;
  const vetCount = employees.filter((e) => e.role === 'Veterinarian').length;
  const managerCount = employees.filter((e) => e.role === 'Farm Manager').length;

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Admin':
        return 'danger';
      case 'Farm Manager':
        return 'warning';
      case 'Veterinarian':
        return 'info';
      case 'Financial Officer':
        return 'purple';
      case 'Employee':
      default:
        return 'default';
    }
  };

  // Columns definition
  const columns = [
    {
      header: 'Staff Member',
      field: 'name',
      render: (r) => {
        const initials = r.name
          ? r.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)
          : 'EM';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-950/40 shrink-0">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-white tracking-tight">{r.name}</div>
              {r.email && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-500" />
                  {r.email}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Contact Phone',
      field: 'phone',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>{r.phone}</span>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      field: 'role',
      render: (r) => <Badge variant={getRoleBadgeVariant(r.role)}>{r.role}</Badge>,
    },
    {
      header: 'Assigned Shift',
      field: 'shift',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-slate-300 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{r.shift}</span>
        </div>
      ),
    },
    {
      header: 'Current Task',
      field: 'assignedTasks',
      render: (r) => {
        const task = r.assignedTasks?.[0];
        if (!task) return <span className="text-slate-500 text-xs italic">No active task</span>;
        return (
          <div className="flex items-center gap-1.5 max-w-[200px] truncate">
            {task.isCompleted ? (
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span className="text-xs text-slate-300 truncate" title={task.title}>
              {task.title}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Duty Status',
      field: 'status',
      render: (r) => (
        <Badge
          variant={
            r.status === 'Active' ? 'success' : r.status === 'On Leave' ? 'warning' : 'default'
          }
        >
          {r.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEdit(r)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all"
            title="Edit Staff Member"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(r)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
            title="Remove Staff Member"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Staff & Operations Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Farm operators, veterinarians, shift rosters, and task scheduling
          </p>
        </div>
        {/* Linked Button to Add Staff Member Form */}
        <Button icon={Plus} onClick={handleOpenAdd} className="shadow-lg shadow-emerald-900/40">
          Add Staff Member
        </Button>
      </div>

      {/* Operational Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Staff</div>
            <div className="text-2xl font-bold text-white mt-1">{totalStaff} Personnel</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active On Duty</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{activeStaff} Active</div>
          </div>
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Veterinary Team</div>
            <div className="text-2xl font-bold text-sky-400 mt-1">{vetCount} Vets</div>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Farm Managers</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{managerCount} Managers</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3 flex-1 shadow-inner">
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search staff by name, phone, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none w-full text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 px-3 font-medium">Status:</span>
          {['All', 'Active', 'On Leave', 'Inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-slate-400 px-2 font-medium shrink-0">Role Filter:</span>
        {['All', ...ROLE_OPTIONS].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              roleFilter === r
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Staff Table */}
      {loading ? (
        <LoadingSpinner text="Loading staff records..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredEmployees}
          emptyText="No staff members found matching your search criteria."
        />
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT STAFF MEMBER MODAL                                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !formSubmitting && setIsFormModalOpen(false)}
        title={modalMode === 'create' ? 'Add New Staff Member' : `Edit Staff Member: ${formData.name}`}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dr. Sarah Mitchell or Kasun Perera"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Contact Phone <span className="text-emerald-400">*</span>
              </label>
              <input
                type="tel"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +94 77 123 4567"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. sarah@dairyfarm.lk"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Operational Role <span className="text-emerald-400">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Assigned Shift Schedule <span className="text-emerald-400">*</span>
              </label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {SHIFT_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Employment Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st} className="bg-slate-900 text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Joined Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Joined / Hire Date
              </label>
              <input
                type="date"
                name="joinedDate"
                value={formData.joinedDate}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Initial Assigned Task */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Initial Assigned Task / Responsibility (Optional)
              </label>
              <input
                type="text"
                name="taskTitle"
                value={formData.taskTitle}
                onChange={handleChange}
                placeholder="e.g. Morning Milking Session, Veterinary Inspection, Feed Distribution"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              disabled={formSubmitting}
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formSubmitting}>
              {formSubmitting
                ? 'Saving...'
                : modalMode === 'create'
                ? 'Add Staff Member'
                : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleting && setIsDeleteModalOpen(false)}
        title="Confirm Staff Removal"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              Are you sure you want to remove{' '}
              <strong className="text-white">{staffToDelete?.name}</strong> (
              {staffToDelete?.role}) from the staff directory? This action cannot be undone.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              disabled={deleting}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleting}
              onClick={handleConfirmDelete}
            >
              {deleting ? 'Removing...' : 'Remove Staff Member'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeDirectory;
