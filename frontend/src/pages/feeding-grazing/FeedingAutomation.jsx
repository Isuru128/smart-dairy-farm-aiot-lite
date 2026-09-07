import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Utensils, Lock, Unlock, Clock, AlertCircle } from 'lucide-react';

const FeedingAutomation = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    farmService.getFeedingSchedules()
      .then((res) => {
        if (res.data) setSchedules(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGateAction = async (gateId, action) => {
    try {
      const res = await farmService.controlGate(gateId, action);
      setActionMsg(`Command sent: Gate ${gateId} is now ${action.toUpperCase()}`);
      setTimeout(() => setActionMsg(''), 4000);
    } catch (e) {
      setActionMsg('Failed to trigger gate actuator');
    }
  };

  const columns = [
    { header: 'Schedule Title', field: 'title', render: (r) => <span className="font-semibold text-white">{r.title}</span> },
    { header: 'Target Group', field: 'targetGroup' },
    { header: 'Scheduled Time', field: 'scheduledTime', render: (r) => <span className="flex items-center gap-1 text-slate-300"><Clock className="w-3.5 h-3.5 text-emerald-400" />{r.scheduledTime}</span> },
    { header: 'Ration Type', field: 'rationType' },
    { header: 'Portion (Kg)', field: 'quantityKg', render: (r) => `${r.quantityKg} kg` },
    {
      header: 'Gate Control',
      field: 'gateId',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleGateAction(r.gateId, 'open')}
            icon={Unlock}
          >
            Open
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGateAction(r.gateId, 'close')}
            icon={Lock}
          >
            Close
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Smart Feeding & Grazing Automation</h2>
          <p className="text-sm text-slate-400 mt-0.5">Automated gate relay integration, scheduled pastures, and ration delivery</p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Fetching feeding schedules..." />
      ) : (
        <DataTable columns={columns} data={schedules} />
      )}
    </div>
  );
};

export default FeedingAutomation;
