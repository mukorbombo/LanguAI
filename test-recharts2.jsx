import React from 'react';
import { renderToString } from 'react-dom/server';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const userGrowthData = [
  { month: 'Jan', users: 10 },
  { month: 'Feb', users: 25 },
];

try {
  const html = renderToString(
    <LineChart data={userGrowthData} width={400} height={400}>
      <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={4} activeDot={{ r: 8 }} />
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
    </LineChart>
  );
  console.log("SUCCESS:", html.length);
} catch (e) {
  console.error("ERROR:", e.message);
}
