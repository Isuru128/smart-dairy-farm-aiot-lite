import React from 'react';
import { useFarmData } from '../../hooks/useFarmData';
import StatCard from '../../components/common/StatCard';
import ProductionTrendChart from '../../components/charts/ProductionTrendChart';
import FinancialBarChart from '../../components/charts/FinancialBarChart';
import Badge from '../../components/common/Badge';
import { Milk, Beef, Thermometer, Droplets, Activity, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const OverviewDashboard = () => {
  const { stats, alerts } = useFarmData();

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Farm Overview & Telemetry</h2>
          <p className="text-sm text-slate-400 mt-0.5">Real-time status of livestock, IoT sensor nodes, and production</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/iot-sensors"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Sensor Array
          </Link>
          <Link
            to="/ai-predictions"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-950"
          >
            AI Forecasts
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Daily Milk Yield"
          value={stats.todayYieldLiters}
          unit="Liters"
          change="4.2%"
          isPositive={true}
          icon={Milk}
          color="emerald"
        />
        <StatCard
          title="Active Livestock"
          value={stats.totalCows}
          unit="Heads"
          change="2.1%"
          isPositive={true}
          icon={Beef}
          color="blue"
        />
        <StatCard
          title="Barn Temperature"
          value={stats.barnTemp}
          icon={Thermometer}
          color="amber"
        />
        <StatCard
          title="Barn Humidity"
          value={stats.barnHumidity}
          icon={Droplets}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">7-Day Milk Production Yield</h3>
              <p className="text-xs text-slate-400">Automated aggregate from milking stations</p>
            </div>
            <Badge variant="success">Live Aggregate</Badge>
          </div>
          <ProductionTrendChart />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Monthly Farm Revenue vs Expenses</h3>
              <p className="text-xs text-slate-400">Milk sales revenue vs feed & medical overhead</p>
            </div>
            <Badge variant="info">Financials</Badge>
          </div>
          <FinancialBarChart />
        </div>
      </div>

      {/* Alerts feed & Quick Actions */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">Active Farm Alerts & Actions</h3>
          </div>
          <Link to="/alerts" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
            View All ({alerts.length}) →
          </Link>
        </div>

        <div className="space-y-3">
          {alerts.slice(0, 3).map((alt, idx) => (
            <div
              key={alt._id || idx}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <div>
                  <h4 className="text-sm font-medium text-white">{alt.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{alt.message}</p>
                </div>
              </div>
              <Badge variant={alt.severity === 'high' ? 'danger' : 'warning'}>{alt.category}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;
