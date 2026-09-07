import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus, Search, Beef, ShieldCheck } from 'lucide-react';

const LivestockManagement = () => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    farmService.getCows()
      .then((res) => {
        if (res.data?.cows) setCows(res.data.cows);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCows = cows.filter(
    (c) =>
      c.tagId.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.breed.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'RFID Tag / ID',
      field: 'tagId',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 font-mono text-xs font-semibold">
            {row.tagId}
          </span>
        </div>
      ),
    },
    {
      header: 'Name',
      field: 'name',
      render: (row) => <span className="font-medium text-white">{row.name}</span>,
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
    { header: 'Lactation Stage', field: 'lactationStage' },
    {
      header: 'Avg Daily Yield',
      field: 'dailyAverageYieldLiters',
      render: (row) => <span className="font-semibold text-emerald-400">{row.dailyAverageYieldLiters || 0} L/day</span>,
    },
    { header: 'Barn Location', field: 'barnLocation' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Livestock Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">RFID profiles, health monitoring, vaccination & breeding history</p>
        </div>
        <Button icon={Plus}>Register Cattle</Button>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by RFID tag, name, or breed..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none w-full text-sm text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <LoadingSpinner text="Loading cattle records..." />
      ) : (
        <DataTable columns={columns} data={filteredCows} emptyText="No cows found matching query" />
      )}
    </div>
  );
};

export default LivestockManagement;
