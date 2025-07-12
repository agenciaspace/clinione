import { useEffect } from 'react';

export const useCleanupOldDrafts = () => {
  useEffect(() => {
    const cleanupOldDrafts = () => {
      try {
        const keys = Object.keys(localStorage);
        const autosaveKeys = keys.filter(key => key.startsWith('autosave_'));
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days

        autosaveKeys.forEach(key => {
          try {
            const saved = localStorage.getItem(key);
            if (saved) {
              const parsed = JSON.parse(saved);
              
              // Remove drafts older than 7 days
              if (parsed.timestamp && parsed.timestamp < sevenDaysAgo) {
                localStorage.removeItem(key);
                console.log(`Removed old draft: ${key}`);
              }
            }
          } catch (error) {
            // If we can't parse the item, remove it
            localStorage.removeItem(key);
            console.log(`Removed corrupted draft: ${key}`);
          }
        });
      } catch (error) {
        console.error('Error cleaning up old drafts:', error);
      }
    };

    // Clean up on component mount
    cleanupOldDrafts();

    // Set up periodic cleanup (every hour)
    const interval = setInterval(cleanupOldDrafts, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};