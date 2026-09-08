import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus, Search, Edit2, Trash2, AlertCircle, CheckCircle2, Beef } from 'lucide-react';

const BREED_OPTIONS = [
  'Holstein Friesian',
  'Jersey',
  'Ayrshire',
  'Brown Swiss',
  'Sahiwal',
  'Guernsey',
  'Crossbreed',
  'Other',
];

const HEALTH_STATUS_OPTIONS = [
  'Healthy',
  'Lactating',
  'Pregnant',
  'Under Treatment',
  'Quarantined',
];

const LACTATION_STAGE_OPTIONS = [
  'Early',
  'Mid',
  'Late',
  'Dry',
  'None',
];

const initialFormState = {
  tagId: '',
  name: '',
  breed: 'Holstein Friesian',
  birthDate: new Date().toISOString().split('T')[0],
  gender: 'Female',
  weightKg: 500,
  healthStatus: 'Healthy',
  lactationStage: 'Early',
  barnLocation: 'Barn A - Stall 01',
  dailyAverageYieldLiters: 22.0,
};

const LivestockManagement = () => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedCow, setSelectedCow] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [notification, setNotification] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cowToDelete, setCowToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCows = async () => {
    try {
      setLoading(true);
      const res = await farmService.getCows();
      if (res.data?.cows) {
        setCows(res.data.cows);
      }
    } catch (err) {
      console.error('Failed to load cattle list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCows();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Open modal for Adding cattle
  const handleOpenAdd = () => {
    setFormData({
      ...initialFormState,
      tagId: `COW-RFID-${100 + (cows.length + 1)}`,
      birthDate: new Date().toISOString().split('T')[0],
    });
    setModalMode('create');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open modal for Editing cattle
  const handleOpenEdit = (cow) => {
    setSelectedCow(cow);
    setFormData({
      tagId: cow.tagId || '',
      name: cow.name || '',
      breed: cow.breed || 'Holstein Friesian',
      birthDate: cow.birthDate ? new Date(cow.birthDate).toISOString().split('T')[0] : '',
      gender: cow.gender || 'Female',
      weightKg: cow.weightKg || 450,
      healthStatus: cow.healthStatus || 'Healthy',
      lactationStage: cow.lactationStage || 'Early',
      barnLocation: cow.barnLocation || 'Barn A - Section 1',
      dailyAverageYieldLiters: cow.dailyAverageYieldLiters || 0,
    });
    setModalMode('edit');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open modal for Delete confirmation
  const handleOpenDelete = (cow) => {
    setCowToDelete(cow);
    setIsDeleteModalOpen(true);
  };

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'weightKg' || name === 'dailyAverageYieldLiters' ? Number(value) : value,
    }));
  };

  // Handle Create / Update Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      if (modalMode === 'create') {
        const res = await farmService.createCow(formData);
        if (res.success) {
          showNotification(`Cattle "${formData.name}" (${formData.tagId}) registered successfully.`);
          setIsFormModalOpen(false);
          await fetchCows();
        } else {
          setFormError(res.message || 'Failed to register cattle');
        }
      } else {
        const targetId = selectedCow._id || selectedCow.tagId;
        const res = await farmService.updateCow(targetId, formData);
        if (res.success) {
          showNotification(`Cattle profile for "${formData.name}" updated successfully.`);
          setIsFormModalOpen(false);
          await fetchCows();
        } else {
          setFormError(res.message || 'Failed to update cattle details');
        }
      }
    } catch (err) {
      setFormError(err.message || 'Error occurred while saving cattle record');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!cowToDelete) return;
    setDeleting(true);
    try {
      const targetId = cowToDelete._id || cowToDelete.tagId;
      const res = await farmService.deleteCow(targetId);
      if (res.success) {
        showNotification(`Cattle record ${cowToDelete.tagId} (${cowToDelete.name}) removed.`);
        setIsDeleteModalOpen(false);
        setCowToDelete(null);
        await fetchCows();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredCows = cows.filter(
    (c) =>
      c.tagId.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.breed.toLowerCase().includes(search.toLowerCase()) ||
      (c.barnLocation && c.barnLocation.toLowerCase().includes(search.toLowerCase()))
  );

  const columns = [
    {
      header: 'RFID Tag / ID',
      field: 'tagId',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg bg-slate-800 text-emerald-400 font-mono text-xs font-semibold border border-slate-700/60">
            {row.tagId}
          </span>
        </div>
      ),
    },
    {
      header: 'Name',
      field: 'name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Beef className="w-4 h-4" />
          </div>
          <span className="font-semibold text-white">{row.name}</span>
        </div>
      ),
    },
    { header: 'Breed', field: 'breed' },
    {
      header: 'Health Status',
      field: 'healthStatus',
      render: (row) => {
        const variant =
          row.healthStatus === 'Healthy' || row.healthStatus === 'Lactating'
            ? 'success'
            : row.healthStatus === 'Pregnant'
            ? 'info'
            : 'danger';
        return <Badge variant={variant}>{row.healthStatus}</Badge>;
      },
    },
    {
      header: 'Lactation Stage',
      field: 'lactationStage',
      render: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {row.lactationStage}
        </span>
      ),
    },
    {
      header: 'Avg Daily Yield',
      field: 'dailyAverageYieldLiters',
      render: (row) => (
        <span className="font-semibold text-emerald-400 font-mono">
          {row.dailyAverageYieldLiters || 0} L/day
        </span>
      ),
    },
    { header: 'Barn Location', field: 'barnLocation' },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all"
            title="Edit Cattle Details"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
            title="Delete Cattle"
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Livestock Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            RFID profiles, cattle registry, health stages, and daily yields
          </p>
        </div>
        {/* Linked Green Button */}
        <Button icon={Plus} onClick={handleOpenAdd} className="shadow-lg shadow-emerald-900/40">
          Add Cattle
        </Button>
      </div>

      {/* Success Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-inner">
        <Search className="w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by RFID tag, name, breed, or stall location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none w-full text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner text="Loading cattle records..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredCows}
          emptyText="No cattle found matching your query."
        />
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT CATTLE MODAL FORM                                              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !formSubmitting && setIsFormModalOpen(false)}
        title={modalMode === 'create' ? 'Register New Cattle' : `Edit Details: ${formData.tagId}`}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* RFID Tag ID */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                RFID Tag ID <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                name="tagId"
                disabled={modalMode === 'edit'}
                value={formData.tagId}
                onChange={handleChange}
                placeholder="e.g. COW-RFID-116"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed font-mono"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Cattle Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Bella"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Breed */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Breed <span className="text-emerald-400">*</span>
              </label>
              <select
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {BREED_OPTIONS.map((breed) => (
                  <option key={breed} value={breed} className="bg-slate-900 text-white">
                    {breed}
                  </option>
                ))}
              </select>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Birth Date <span className="text-emerald-400">*</span>
              </label>
              <input
                type="date"
                required
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Female" className="bg-slate-900 text-white">Female</option>
                <option value="Male" className="bg-slate-900 text-white">Male</option>
              </select>
            </div>

            {/* Weight (Kg) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Weight (Kg) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                min="50"
                max="1200"
                required
                name="weightKg"
                value={formData.weightKg}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Health Status */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Health Status</label>
              <select
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {HEALTH_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status} className="bg-slate-900 text-white">
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Lactation Stage */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Lactation Stage</label>
              <select
                name="lactationStage"
                value={formData.lactationStage}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {LACTATION_STAGE_OPTIONS.map((stage) => (
                  <option key={stage} value={stage} className="bg-slate-900 text-white">
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            {/* Barn Location */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Barn Location</label>
              <input
                type="text"
                name="barnLocation"
                value={formData.barnLocation}
                onChange={handleChange}
                placeholder="e.g. Barn A - Stall 04"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Daily Average Yield */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Avg Daily Yield (Liters)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="80"
                name="dailyAverageYieldLiters"
                value={formData.dailyAverageYieldLiters}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Action Buttons */}
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
                ? 'Register Cattle'
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
        title="Confirm Cattle Removal"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to remove cattle record{' '}
            <strong className="text-emerald-400 font-mono">{cowToDelete?.tagId}</strong> (
            <span className="text-white font-medium">{cowToDelete?.name}</span>)?
          </p>
          <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
            ⚠ Warning: This will permanently delete the cattle profile and associated livestock logs.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              {deleting ? 'Removing...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LivestockManagement;
