import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'typeface-roboto';
import './index.css';

// ===== MONACO ENVIRONMENT SETUP (MUST BE FIRST!) =====
// Configure Monaco Editor workers BEFORE anything else loads
// This prevents "undoRedoService which is NOT registered" errors
(globalThis as any).MonacoEnvironment = {
  getWorkerUrl(_: any, label: string) {
    // In production, vite-plugin-monaco-editor puts workers in /monacoeditorwork/
    // In dev, Vite serves them via middleware
    if (label === 'graphql') {
      return new URL('monaco-graphql/esm/graphql.worker', import.meta.url).href;
    }
    if (label === 'json') {
      return new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url).href;
    }
    // Base editor worker
    return new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url).href;
  },
};
// ===== END MONACO ENVIRONMENT SETUP =====

// Suppress extension-related errors in development
if (process.env.NODE_ENV === 'development') {
  // Filter out known browser extension errors
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && (
      message.includes('message channel closed') ||
      message.includes('Extension context invalidated') ||
      message.includes('Could not establish connection')
    )) {
      // Suppress browser extension errors
      return;
    }
    originalError.apply(console, args);
  };
}

// Simplified service worker registration
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registered'))
      .catch(() => console.log('SW registration failed'));
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);