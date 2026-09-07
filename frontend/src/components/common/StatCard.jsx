import React from 'react';

const StatCard = ({ title, value, unit = '', change, isPositive = true, icon: Icon, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  const badgeColor = colorMap[color] || colorMap.emerald;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg hover:shadow-xl relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${badgeColor} transition-transform group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          <span className={`px-2 py-0.5 rounded-md ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {isPositive ? '+' : ''}{change}
          </span>
          <span className="text-slate-400">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
