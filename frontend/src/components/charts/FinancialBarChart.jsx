import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const mockFinance = [
  { month: 'Apr', income: 24000, expense: 12500 },
  { month: 'May', income: 26500, expense: 13200 },
  { month: 'Jun', income: 27800, expense: 14100 },
  { month: 'Jul', income: 29100, expense: 14800 },
  { month: 'Aug', income: 28450, expense: 14230 },
];

const FinancialBarChart = ({ data = mockFinance, height = 260 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
            formatter={(value) => [`LKR ${Number(value).toLocaleString()}`]}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Bar dataKey="income" name="Income (LKR)" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expenses (LKR)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialBarChart;
