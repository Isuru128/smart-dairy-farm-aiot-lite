import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import ProductionTrendChart from '../../components/charts/ProductionTrendChart';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Milk, Droplet, Plus, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const MilkProductionDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([farmService.getMilkLogs(), farmService.getMilkAnalytics()])
      .then(([logsRes, analyticsRes]) => {
        if (logsRes.data) setLogs(logsRes.data);
        if (analyticsRes.data) setAnalytics(analyticsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { header: 'Cow RFID', field: 'cowTagId', render: (r) => <span className="font-mono text-xs text-emerald-400 font-semibold">{r.cowTagId}</span> },
    {
      header: 'Session',
      field: 'session',
      render: (r) => <Badge variant={r.session === 'Morning' ? 'info' : 'purple'}>{r.session}</Badge>,
    },
    { header: 'Quantity (L)', field: 'quantityLiters', render: (r) => <span className="font-bold text-white">{r.quantityLiters} L</span> },
    { header: 'Fat Content', field: 'fatPercentage', render: (r) => `${r.fatPercentage}%` },
    { header: 'Protein Content', field: 'proteinPercentage', render: (r) => `${r.proteinPercentage}%` },
    { header: 'Date Recorded', field: 'date', render: (r) => formatDate(r.date) },
  ];

  if (loading) return <LoadingSpinner text="Fetching milk logs..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Milk Production & Analytics</h2>
          <p className="text-sm text-slate-400 mt-0.5">Automated milking station metrics, sessions, and milk quality analysis</p>
        </div>
        <Button icon={Plus}>Log Milking Session</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Today Total Yield" value={analytics?.todayTotalLiters || 842.5} unit="L" icon={Milk} color="emerald" />
        <StatCard title="Morning Session" value={analytics?.morningSessionLiters || 450.2} unit="L" icon={Droplet} color="blue" />
        <StatCard title="Evening Session" value={analytics?.eveningSessionLiters || 392.3} unit="L" icon={Droplet} color="purple" />
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h3 className="font-semibold text-white mb-4">Daily Yield Distribution</h3>
        <ProductionTrendChart />
      </div>

      <div>
        <h3 className="font-semibold text-white mb-3">Recent Milking Session Records</h3>
        <DataTable columns={columns} data={logs} />
      </div>
    </div>
  );
};

export default MilkProductionDashboard;
