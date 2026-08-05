import { JSDOM } from 'jsdom';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './src/pages/AdminDashboard.tsx';

// Setup DOM
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost'
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Render
try {
  console.log("Trying to render AdminDashboard...");
  // We cannot easily compile JSX on the fly in plain Node, let's just use tsx.
} catch (e) {
  console.error(e);
}
