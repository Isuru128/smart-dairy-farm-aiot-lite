import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import StatCard from '../../components/common/StatCard';
import FinancialBarChart from '../../components/charts/FinancialBarChart';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const FinancialReports = () => {
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    farmService.getFinancials()
      .then((res) => {
        if (res.data) setFinance(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      header: 'Type',
      field: 'type',
      render: (r) => (
        <Badge variant={r.type === 'income' ? 'success' : 'danger'}>
          {r.type.toUpperCase()}
        </Badge>
      ),
    },
    { header: 'Category', field: 'category' },
    { header: 'Description', field: 'description', render: (r) => <span className="text-white">{r.description}</span> },
    {
      header: 'Amount',
      field: 'amount',
      render: (r) => (
        <span className={`font-semibold ${r.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {r.type === 'income' ? '+' : '-'}{formatCurrency(r.amount)}
        </span>
      ),
    },
    { header: 'Date', field: 'date' },
  ];

  if (loading) return <LoadingSpinner text="Compiling financial summaries..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Financial & Revenue Analytics</h2>
        <p className="text-sm text-slate-400 mt-0.5">Milk sales cashflows, feed expenses, medication overhead, and monthly profitability</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Monthly Revenue" value={formatCurrency(finance?.totalRevenueMonth || 28450)} icon={TrendingUp} color="emerald" />
        <StatCard title="Total Operating Costs" value={formatCurrency(finance?.totalExpensesMonth || 14230)} icon={TrendingDown} color="rose" />
        <StatCard title="Net Monthly Profit" value={formatCurrency(finance?.netProfitMonth || 14220)} icon={DollarSign} color="blue" />
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="font-semibold text-white mb-4">Cashflow Trends</h3>
        <FinancialBarChart />
      </div>

      <div>
        <h3 className="font-semibold text-white mb-3">Recent Transactions</h3>
        <DataTable columns={columns} data={finance?.recentTransactions || []} />
      </div>
    </div>
  );
};

export default FinancialReports;
