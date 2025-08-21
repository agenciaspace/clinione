import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { trackPageReload, getReloadInfo } from './utils/debug-reload'

// Clear service worker in development mode
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(() => {
        console.log('Service worker unregistered in development mode');
      });
    }
  });
}

// Track reload info for debugging
if (import.meta.env.DEV) {
  trackPageReload();
  const reloadInfo = getReloadInfo();
  if (reloadInfo && reloadInfo.count > 1) {
    console.warn(`⚠️ Multiple reloads detected (${reloadInfo.count}). Last reload:`, reloadInfo.timestamp);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
