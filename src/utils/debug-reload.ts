// Debug utility to track page reloads and their causes
let reloadCount = 0;

export const trackPageReload = () => {
  if (import.meta.env.DEV) {
    reloadCount++;
    console.log(`🔄 Page reload #${reloadCount} detected at:`, new Date().toISOString());
    
    // Track the stack trace to see what caused the reload
    console.trace('Reload stack trace');
    
    // Store reload info in sessionStorage to persist across reloads
    try {
      const reloadInfo = {
        count: reloadCount,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      sessionStorage.setItem('debug_reload_info', JSON.stringify(reloadInfo));
    } catch (e) {
      console.warn('Could not store reload info:', e);
    }
  }
};

export const getReloadInfo = () => {
  try {
    const info = sessionStorage.getItem('debug_reload_info');
    return info ? JSON.parse(info) : null;
  } catch (e) {
    return null;
  }
};

export const logReloadCause = (cause: string, details?: any) => {
  if (import.meta.env.DEV) {
    console.warn(`🚨 Potential reload cause: ${cause}`, details);
  }
};

// Track if this is a fresh load or a reload
if (import.meta.env.DEV) {
  window.addEventListener('beforeunload', () => {
    logReloadCause('beforeunload event triggered');
  });
  
  window.addEventListener('unload', () => {
    logReloadCause('unload event triggered');
  });
}