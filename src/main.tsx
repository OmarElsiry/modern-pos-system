import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './i18n';

import './index.css';

// Performance timing marks for optimization tracking
performance.mark('app-script-start');

console.log('🚀 main.tsx is executing');

// Check if we're in Electron with Node.js access
const isElectron = typeof process !== 'undefined' && process.versions && process.versions.electron;
console.log('📍 Environment:', isElectron ? 'Electron' : 'Browser');

// Main entry point for the renderer process

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found!');
  }

  console.log('✅ Root element found, rendering app...');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );

  console.log('✅ App rendered successfully!');

  // Mark app as rendered and measure TTI
  performance.mark('app-rendered');
  performance.measure('time-to-render', 'app-script-start', 'app-rendered');

  const renderTime = performance.getEntriesByName('time-to-render')[0];
  console.log(`⏱️ Time to Render: ${renderTime?.duration.toFixed(2)}ms`);
} catch (error) {
  console.error('❌ Error during initialization:', error);
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'padding: 2.5rem; background: #d32f2f; color: white; font-family: monospace;';

  const h1 = document.createElement('h1');
  h1.textContent = '❌ Initialization Error';
  errorDiv.appendChild(h1);

  const preMsg = document.createElement('pre');
  preMsg.textContent = error instanceof Error ? error.message : String(error);
  errorDiv.appendChild(preMsg);

  const preStack = document.createElement('pre');
  preStack.textContent = error instanceof Error ? error.stack || '' : '';
  errorDiv.appendChild(preStack);

  document.body.appendChild(errorDiv);
}
