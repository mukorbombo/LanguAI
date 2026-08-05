import React from 'react';
import { renderToString } from 'react-dom/server';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const learningActivityData = [
  { name: 'Reading', value: 35 },
  { name: 'Writing', value: 20 }
];
const COLORS = ['#4f46e5', '#0ea5e9'];

try {
  const html = renderToString(
    <PieChart width={400} height={400}>
      <Pie
        data={learningActivityData}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={90}
        paddingAngle={5}
        dataKey="value"
      >
        {learningActivityData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
  console.log("SUCCESS:", html.length);
} catch (e) {
  console.error("ERROR:", e.message);
}
