import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Bell, Check, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const AlertsCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = () => {
    farmService.getAlerts()
      .then((res) => {
        if (res.data) setAlerts(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id) => {
    await farmService.resolveAlert(id);
    fetchAlerts();
  };

  const columns = [
    {
      header: 'Severity',
      field: 'severity',
      render: (r) => {
        const icon =
          r.severity === 'critical' || r.severity === 'high' ? (
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          );
        return (
          <div className="flex items-center gap-1.5 capitalize font-medium">
            {icon}
            <Badge variant={r.severity === 'high' ? 'danger' : 'warning'}>{r.severity}</Badge>
          </div>
        );
      },
    },
    { header: 'Category', field: 'category' },
    { header: 'Title', field: 'title', render: (r) => <span className="font-semibold text-white">{r.title}</span> },
    { header: 'Description', field: 'message' },
    {
      header: 'Status',
      field: 'isResolved',
      render: (r) => (
        <Badge variant={r.isResolved ? 'success' : 'danger'}>
          {r.isResolved ? 'Resolved' : 'Active'}
        </Badge>
      ),
    },
    {
      header: 'Action',
      field: '_id',
      render: (r) =>
        !r.isResolved ? (
          <Button size="sm" variant="outline" onClick={() => handleResolve(r._id)} icon={Check}>
            Acknowledge
          </Button>
        ) : (
          <span className="text-xs text-slate-500">Completed</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Alerts & System Notifications</h2>
          <p className="text-sm text-slate-400 mt-0.5">Sensor warnings, vaccination schedule alerts, and automated threshold breaches</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching active alerts..." />
      ) : (
        <DataTable columns={columns} data={alerts} />
      )}
    </div>
  );
};

export default AlertsCenter;
