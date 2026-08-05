import { createRoot } from 'react-dom/client';
import { PieChart, Pie, Cell } from 'recharts';
import React from 'react';

const container = document.createElement('div');
const root = createRoot(container);
try {
  root.render(<PieChart width={100} height={100}><Pie data={[]} dataKey="value" /></PieChart>);
  console.log("SUCCESS");
} catch(e) {
  console.log("ERROR:", e);
}
