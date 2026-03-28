// main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import App from './App.jsx';

const rootEl = document.getElementById('root');

if (!rootEl) {
  throw new Error('Root element with id "root" not found');
}

const root = createRoot(rootEl);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
