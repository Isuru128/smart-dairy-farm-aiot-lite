import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const mockData = [
  { day: 'Mon', liters: 810 },
  { day: 'Tue', liters: 825 },
  { day: 'Wed', liters: 840 },
  { day: 'Thu', liters: 835 },
  { day: 'Fri', liters: 855 },
  { day: 'Sat', liters: 848 },
  { day: 'Sun', liters: 842 },
];

const ProductionTrendChart = ({ data = mockData, height = 260 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="milkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="day" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
            formatter={(value) => [`${value} L`, 'Milk Production']}
          />
          <Area type="monotone" dataKey="liters" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#milkGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductionTrendChart;
