import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'typeface-roboto';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Neue Version verfügbar. Seite neu laden?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ist jetzt offline verfügbar.");
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);