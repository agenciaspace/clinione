# Service Worker Fix Guide

## Problem
The dashboard was showing infinite network requests due to Workbox service worker configuration issues.

## Solution Applied

### 1. Disabled Service Worker in Development
- Modified `vite.config.ts` to only enable PWA in production mode
- This prevents service worker conflicts during development

### 2. Changed API Caching Strategy
- Changed Supabase REST API from `NetworkFirst` to `NetworkOnly`
- This prevents caching conflicts that could cause infinite requests

### 3. Improved ClinicContext Logic
- Modified the `useEffect` dependency to only watch `user?.id` instead of the entire `user` object
- Added conditions to prevent unnecessary API calls
- This reduces the number of requests to the clinics endpoint

### 4. Manual Cache Clearing
- Removed `dev-dist/` and `dist/` directories
- Created `public/clear-sw.js` script for manual cache clearing

## For Users Experiencing Issues

### Clear Browser Cache
1. Open Developer Tools (F12)
2. Go to Application tab
3. Click "Clear Storage" 
4. Check all boxes and click "Clear site data"

### Manual Service Worker Clearing
1. Open Developer Tools (F12)
2. Go to Console tab
3. Paste and run this code:

```javascript
// Clear service worker cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  });
}

console.log('Service worker and caches cleared');
```

### Alternative: Hard Refresh
1. Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Or hold Shift and click the refresh button

## Configuration Changes

### vite.config.ts
- Service worker only enabled in production
- Supabase API uses NetworkOnly strategy
- Improved caching configuration

### ClinicContext.tsx
- Optimized useEffect dependencies
- Reduced unnecessary API calls
- Better user state management

## Testing
After applying these fixes:
1. Clear browser cache
2. Hard refresh the page
3. Check that dashboard loads without infinite requests
4. Verify that navigation works properly

## Production Considerations
- Service worker will still be active in production builds
- API caching is disabled for development but enabled for production
- These changes should not affect production performance