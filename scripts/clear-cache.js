// Script to clear all caches and service workers for debugging
// Run this in the browser console to completely reset the app

(async function clearAllCache() {
  console.log('🧹 Starting cache cleanup...');
  
  // 1. Clear localStorage
  try {
    localStorage.clear();
    console.log('✅ localStorage cleared');
  } catch (e) {
    console.log('❌ Failed to clear localStorage:', e);
  }
  
  // 2. Clear sessionStorage
  try {
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
  } catch (e) {
    console.log('❌ Failed to clear sessionStorage:', e);
  }
  
  // 3. Clear indexedDB
  try {
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases.map(({ name }) => {
          return new Promise((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase(name);
            deleteReq.onerror = () => reject(deleteReq.error);
            deleteReq.onsuccess = () => resolve();
          });
        })
      );
      console.log('✅ IndexedDB cleared');
    }
  } catch (e) {
    console.log('❌ Failed to clear IndexedDB:', e);
  }
  
  // 4. Unregister all service workers
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('✅ Service workers unregistered');
    }
  } catch (e) {
    console.log('❌ Failed to unregister service workers:', e);
  }
  
  // 5. Clear all caches
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('✅ All caches cleared');
    }
  } catch (e) {
    console.log('❌ Failed to clear caches:', e);
  }
  
  console.log('🎉 Cache cleanup complete! Please refresh the page.');
})();