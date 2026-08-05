import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

import { createRoot } from 'react-dom/client';
import { PieChart, Pie, Cell } from 'recharts';
import React from 'react';

const container = document.getElementById('root');
const root = createRoot(container);
try {
  root.render(<PieChart width={100} height={100}><Pie data={[{value:1}]} dataKey="value" /></PieChart>);
  console.log("SUCCESS");
} catch(e) {
  console.log("ERROR:", e);
}
