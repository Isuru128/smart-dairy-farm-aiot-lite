import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import ProductionTrendChart from '../../components/charts/ProductionTrendChart';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Milk,
  Droplet,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Activity,
  Calendar,
  User,
  Tag,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const SESSION_OPTIONS = ['Morning', 'Evening', 'Special'];

const initialFormState = {
  cowTagId: '',
  session: 'Morning',
  quantityLiters: '',
  fatPercentage: '3.8',
  proteinPercentage: '3.2',
  temperatureCelsius: '37.0',
  recordedBy: 'Milking Operator',
  date: new Date().toISOString().split('T')[0],
  notes: '',
};

const MilkProductionDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState('All');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedLog, setSelectedLog] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [notification, setNotification] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, analyticsRes, cowsRes] = await Promise.allSettled([
        farmService.getMilkLogs(),
        farmService.getMilkAnalytics(),
        farmService.getCows(),
      ]);

      if (logsRes.status === 'fulfilled' && logsRes.value?.data) {
        setLogs(logsRes.value.data);
      }
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data) {
        setAnalytics(analyticsRes.value.data);
      }
      if (cowsRes.status === 'fulfilled' && cowsRes.value?.data) {
        setCows(cowsRes.value.data);
      }
    } catch (err) {
      console.error('Failed to fetch milk production data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Open modal for Logging a new milking session
  const handleOpenAdd = () => {
    setFormData({
      ...initialFormState,
      cowTagId: cows.length > 0 ? cows[0].tagId : 'COW-RFID-101',
      date: new Date().toISOString().split('T')[0],
    });
    setModalMode('create');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open modal for Editing an existing milking session
  const handleOpenEdit = (log) => {
    setSelectedLog(log);
    setFormData({
      cowTagId: log.cowTagId || '',
      session: log.session || 'Morning',
      quantityLiters: log.quantityLiters !== undefined ? log.quantityLiters : '',
      fatPercentage: log.fatPercentage !== undefined ? String(log.fatPercentage) : '3.8',
      proteinPercentage: log.proteinPercentage !== undefined ? String(log.proteinPercentage) : '3.2',
      temperatureCelsius: log.temperatureCelsius !== undefined ? String(log.temperatureCelsius) : '37.0',
      recordedBy: log.recordedBy || 'Milking Operator',
      date: log.date ? new Date(log.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: log.notes || '',
    });
    setModalMode('edit');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open modal for Confirming Deletion
  const handleOpenDelete = (log) => {
    setLogToDelete(log);
    setIsDeleteModalOpen(true);
  };

  // Handle Form Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.cowTagId.trim()) {
      setFormError('Cow RFID Tag ID is required');
      return;
    }

    if (!formData.quantityLiters || isNaN(Number(formData.quantityLiters)) || Number(formData.quantityLiters) <= 0) {
      setFormError('Please enter a valid milk quantity greater than 0');
      return;
    }

    try {
      setFormSubmitting(true);

      const payload = {
        cowTagId: formData.cowTagId.trim().toUpperCase(),
        session: formData.session,
        quantityLiters: Number(formData.quantityLiters),
        fatPercentage: Number(formData.fatPercentage) || 3.8,
        proteinPercentage: Number(formData.proteinPercentage) || 3.2,
        temperatureCelsius: Number(formData.temperatureCelsius) || 37.0,
        recordedBy: formData.recordedBy.trim() || 'Milking Operator',
        date: formData.date,
        notes: formData.notes.trim(),
      };

      if (modalMode === 'create') {
        const res = await farmService.recordMilk(payload);
        const newRecord = res.data || {
          _id: `milk-${Date.now()}`,
          ...payload,
          createdAt: new Date(),
        };

        setLogs((prev) => [newRecord, ...prev]);

        // Update analytics locally
        setAnalytics((prev) => {
          const addedLiters = newRecord.quantityLiters;
          const currentTotal = Number(prev?.todayTotalLiters || 0) + addedLiters;
          const currentMorning = Number(prev?.morningSessionLiters || 0) + (newRecord.session === 'Morning' ? addedLiters : 0);
          const currentEvening = Number(prev?.eveningSessionLiters || 0) + (newRecord.session === 'Evening' ? addedLiters : 0);

          return {
            ...prev,
            todayTotalLiters: Number(currentTotal.toFixed(1)),
            morningSessionLiters: Number(currentMorning.toFixed(1)),
            eveningSessionLiters: Number(currentEvening.toFixed(1)),
          };
        });

        showNotification(`Milking session of ${newRecord.quantityLiters}L logged for ${newRecord.cowTagId}.`);
      } else {
        const logId = selectedLog._id;
        const res = await farmService.updateMilkLog(logId, payload);
        const updatedRecord = res.data || {
          ...selectedLog,
          ...payload,
        };

        setLogs((prev) =>
          prev.map((item) => (item._id === logId ? updatedRecord : item))
        );

        showNotification(`Milking record for ${payload.cowTagId} updated successfully.`);
      }

      setIsFormModalOpen(false);
    } catch (err) {
      console.error('Failed to save milking log:', err);
      setFormError(err.response?.data?.message || err.message || 'Error saving milking session.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!logToDelete) return;
    try {
      setDeleting(true);
      await farmService.deleteMilkLog(logToDelete._id);
      setLogs((prev) => prev.filter((item) => item._id !== logToDelete._id));

      // Adjust analytics totals
      setAnalytics((prev) => {
        const subtractedLiters = Number(logToDelete.quantityLiters) || 0;
        const currentTotal = Math.max(0, Number(prev?.todayTotalLiters || 0) - subtractedLiters);
        const currentMorning = Math.max(
          0,
          Number(prev?.morningSessionLiters || 0) - (logToDelete.session === 'Morning' ? subtractedLiters : 0)
        );
        const currentEvening = Math.max(
          0,
          Number(prev?.eveningSessionLiters || 0) - (logToDelete.session === 'Evening' ? subtractedLiters : 0)
        );

        return {
          ...prev,
          todayTotalLiters: Number(currentTotal.toFixed(1)),
          morningSessionLiters: Number(currentMorning.toFixed(1)),
          eveningSessionLiters: Number(currentEvening.toFixed(1)),
        };
      });

      showNotification(`Milking record for ${logToDelete.cowTagId} was deleted.`);
      setIsDeleteModalOpen(false);
      setLogToDelete(null);
    } catch (err) {
      console.error('Failed to delete milking record:', err);
      alert(err.response?.data?.message || 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  // Filter logic
  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.cowTagId?.toLowerCase().includes(q) ||
      log.recordedBy?.toLowerCase().includes(q) ||
      log.notes?.toLowerCase().includes(q);

    const matchesSession = sessionFilter === 'All' || log.session === sessionFilter;

    return matchesSearch && matchesSession;
  });

  // Calculate dynamic stats from all logs
  const totalYieldSum = logs.reduce((sum, l) => sum + (Number(l.quantityLiters) || 0), 0);
  const morningYieldSum = logs
    .filter((l) => l.session === 'Morning')
    .reduce((sum, l) => sum + (Number(l.quantityLiters) || 0), 0);
  const eveningYieldSum = logs
    .filter((l) => l.session === 'Evening')
    .reduce((sum, l) => sum + (Number(l.quantityLiters) || 0), 0);

  const avgFatRate = logs.length > 0
    ? (logs.reduce((sum, l) => sum + (Number(l.fatPercentage) || 3.8), 0) / logs.length).toFixed(2)
    : '4.10';

  const avgProteinRate = logs.length > 0
    ? (logs.reduce((sum, l) => sum + (Number(l.proteinPercentage) || 3.2), 0) / logs.length).toFixed(2)
    : '3.40';

  const columns = [
    {
      header: 'Cow RFID',
      field: 'cowTagId',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-mono text-xs text-emerald-400 font-bold tracking-wider">{r.cowTagId}</span>
            {r.notes && <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{r.notes}</div>}
          </div>
        </div>
      ),
    },
    {
      header: 'Session',
      field: 'session',
      render: (r) => (
        <Badge
          variant={
            r.session === 'Morning' ? 'info' : r.session === 'Evening' ? 'purple' : 'warning'
          }
        >
          {r.session}
        </Badge>
      ),
    },
    {
      header: 'Quantity (L)',
      field: 'quantityLiters',
      render: (r) => (
        <span className="font-bold text-white font-mono text-sm bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
          {r.quantityLiters} L
        </span>
      ),
    },
    {
      header: 'Quality Profile',
      field: 'fatPercentage',
      render: (r) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-amber-400 font-mono" title="Butterfat Content">
            {r.fatPercentage}% Fat
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-sky-400 font-mono" title="Protein Content">
            {r.proteinPercentage}% Prot
          </span>
        </div>
      ),
    },
    {
      header: 'Temperature',
      field: 'temperatureCelsius',
      render: (r) => (
        <div className="flex items-center gap-1 text-slate-300 text-xs font-mono">
          <Thermometer className="w-3.5 h-3.5 text-rose-400" />
          <span>{r.temperatureCelsius || 37.0}°C</span>
        </div>
      ),
    },
    {
      header: 'Operator / Station',
      field: 'recordedBy',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <User className="w-3 h-3 text-slate-500" />
          <span className="truncate max-w-[120px]">{r.recordedBy || 'Station Alpha'}</span>
        </div>
      ),
    },
    {
      header: 'Date Recorded',
      field: 'date',
      render: (r) => (
        <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
          <Calendar className="w-3 h-3 text-slate-500" />
          <span>{formatDate(r.date)}</span>
        </div>
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
            title="Edit Milking Record"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(r)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner text="Fetching milk logs & analytics..." />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Milk Production & Analytics</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Automated milking station metrics, sessions, and milk quality analysis
          </p>
        </div>
        {/* Linked Green Action Button */}
        <Button icon={Plus} onClick={handleOpenAdd} className="shadow-lg shadow-emerald-900/40">
          Log Milking Session
        </Button>
      </div>

      {/* Production Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Recorded Yield Total"
          value={analytics?.todayTotalLiters || totalYieldSum.toFixed(1)}
          unit="L"
          icon={Milk}
          color="emerald"
        />
        <StatCard
          title="Morning Session"
          value={analytics?.morningSessionLiters || morningYieldSum.toFixed(1)}
          unit="L"
          icon={Droplet}
          color="blue"
        />
        <StatCard
          title="Evening Session"
          value={analytics?.eveningSessionLiters || eveningYieldSum.toFixed(1)}
          unit="L"
          icon={Droplet}
          color="purple"
        />
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Quality Averages</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-1">{avgFatRate}% <span className="text-xs text-slate-400">Fat</span></div>
            <div className="text-xs font-semibold text-sky-400 font-mono">{avgProteinRate}% <span className="text-[10px] text-slate-400">Protein</span></div>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Activity className="w-6 h-6" />
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

      {/* Daily Yield Distribution Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white tracking-tight">Daily Yield Distribution</h3>
            <p className="text-xs text-slate-400">7-day volumetric output trend across automated milking clusters</p>
          </div>
        </div>
        <ProductionTrendChart />
      </div>

      {/* Search & Session Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3 flex-1 shadow-inner">
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search by cow tag ID, operator name, or notes..."
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

        {/* Session Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 px-3 font-medium">Session:</span>
          {['All', ...SESSION_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setSessionFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                sessionFilter === s
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white tracking-tight">Recent Milking Session Records</h3>
          <span className="text-xs text-slate-400">
            Showing {filteredLogs.length} of {logs.length} logged sessions
          </span>
        </div>
        <DataTable
          columns={columns}
          data={filteredLogs}
          emptyText="No milking sessions found matching your filters."
        />
      </div>

      {/* ========================================================================= */}
      {/* LOG / EDIT MILKING SESSION MODAL                                          */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !formSubmitting && setIsFormModalOpen(false)}
        title={
          modalMode === 'create'
            ? 'Log Milking Session'
            : `Edit Milking Record: ${formData.cowTagId}`
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cow RFID Tag */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Cow RFID Tag ID <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                name="cowTagId"
                list="cow-tag-options"
                value={formData.cowTagId}
                onChange={handleChange}
                placeholder="e.g. COW-RFID-101"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <datalist id="cow-tag-options">
                {cows.map((c) => (
                  <option key={c._id || c.tagId} value={c.tagId}>
                    {c.tagId} ({c.name} - {c.breed})
                  </option>
                ))}
              </datalist>
            </div>

            {/* Session */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Milking Session <span className="text-emerald-400">*</span>
              </label>
              <select
                name="session"
                value={formData.session}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {SESSION_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    {s} Session
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity in Liters */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Milk Yield (Liters) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                name="quantityLiters"
                value={formData.quantityLiters}
                onChange={handleChange}
                placeholder="e.g. 14.5"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Milk Temperature */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Milk Temp (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name="temperatureCelsius"
                value={formData.temperatureCelsius}
                onChange={handleChange}
                placeholder="37.0"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Fat Percentage */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Butterfat Content (%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="10"
                name="fatPercentage"
                value={formData.fatPercentage}
                onChange={handleChange}
                placeholder="3.8"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Protein Percentage */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Protein Content (%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="10"
                name="proteinPercentage"
                value={formData.proteinPercentage}
                onChange={handleChange}
                placeholder="3.2"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Session Date <span className="text-emerald-400">*</span>
              </label>
              <input
                type="date"
                required
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Operator / Station */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Operator / Station Name
              </label>
              <input
                type="text"
                name="recordedBy"
                value={formData.recordedBy}
                onChange={handleChange}
                placeholder="e.g. Milking Station Alpha, Kasun"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Session Notes & Milk Flow Observations (Optional)
              </label>
              <textarea
                rows="2"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. High morning flow rate, cow entered station smoothly, milk clear of floccules"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
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
                ? 'Logging...'
                : modalMode === 'create'
                ? 'Log Milking Session'
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
        title="Confirm Record Deletion"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              Are you sure you want to delete the milking session record for{' '}
              <strong className="text-white font-mono">{logToDelete?.cowTagId}</strong> (
              {logToDelete?.quantityLiters} Liters - {logToDelete?.session} Session)?
              This will update today's production analytics immediately.
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
              {deleting ? 'Deleting...' : 'Delete Record'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MilkProductionDashboard;
