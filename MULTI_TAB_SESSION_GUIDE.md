# Multi-Tab Session Management Guide

## Overview
The Clinio application now supports persistent session management across multiple browser tabs with synchronized login/logout functionality.

## Features Implemented

### 1. Cross-Tab Session Persistence
- When a user logs in on one tab, they are automatically logged in on all other tabs
- Session state is maintained when opening new tabs
- User doesn't need to re-login when switching between tabs

### 2. Synchronized Logout
- When a user logs out on one tab, they are automatically logged out on all other tabs
- Prevents security issues where user thinks they're logged out but still authenticated in other tabs
- Immediate logout across all tabs without page refresh

### 3. Session Validation
- Periodic session validation (every 30 seconds) to detect expired sessions
- Automatic logout if session expires
- Session validation when user returns to tab (focus event)

## Technical Implementation

### Core Components

#### 1. `useTabSyncAuth` Hook (`/src/hooks/useTabSyncAuth.ts`)
- Handles cross-tab communication using localStorage events
- Broadcasts login/logout events to other tabs
- Filters out stale events (older than 5 seconds)
- Prevents duplicate processing of auth events

#### 2. Enhanced `AuthContext` (`/src/contexts/AuthContext.tsx`)
- Integrated with `useTabSyncAuth` for cross-tab communication
- Periodic session validation
- Focus event handling for session checks
- Proper cleanup of event listeners

### Browser Storage Events
- Uses `localStorage` for cross-tab communication
- Event key: `clinio_auth_event`
- Event types: `login`, `logout`
- Auto-cleanup of events to prevent memory leaks

## Testing Instructions

### Test 1: Login Persistence
1. Open the application in one tab
2. Log in with valid credentials
3. Open a new tab with the same application URL
4. ✅ **Expected**: User should be automatically logged in without entering credentials

### Test 2: Cross-Tab Logout
1. Have the application open in multiple tabs (logged in)
2. Log out in one tab
3. Switch to other tabs
4. ✅ **Expected**: User should be automatically logged out in all tabs

### Test 3: Session Expiration
1. Log in to the application
2. Wait for session to expire (or simulate by clearing Supabase session)
3. ✅ **Expected**: User should be automatically logged out across all tabs

### Test 4: Focus Validation
1. Log in to the application
2. Leave the tab inactive for a while
3. Return to the tab (focus event)
4. ✅ **Expected**: Session should be validated and maintained if still valid

## Security Considerations

- Session validation occurs every 30 seconds
- Events are filtered by timestamp to prevent replay attacks
- Proper cleanup of event listeners to prevent memory leaks
- Local storage events are automatically cleaned up after 2 seconds

## Browser Compatibility

- Works in all modern browsers that support:
  - `localStorage`
  - `storage` events
  - `focus` events
  - ES6+ features

## Configuration

### Session Check Interval
Currently set to 30 seconds. Can be adjusted in `AuthContext.tsx`:

```typescript
const sessionCheckInterval = setInterval(async () => {
  // Session validation logic
}, 30000); // 30 seconds
```

### Event Timeout
Auth events expire after 5 seconds. Can be adjusted in `useTabSyncAuth.ts`:

```typescript
if (Date.now() - authEvent.timestamp > 5000) {
  return; // Ignore stale events
}
```

## Troubleshooting

### Common Issues

1. **Session not syncing across tabs**
   - Check if localStorage is available and enabled
   - Verify browser allows cross-tab communication
   - Check browser console for errors

2. **Logout not working across tabs**
   - Ensure the `broadcastLogout` function is being called
   - Check if storage events are being fired
   - Verify event listeners are properly attached

3. **Session validation issues**
   - Check Supabase session configuration
   - Verify network connectivity
   - Check browser console for authentication errors

### Debug Mode
Enable debug logging by opening browser console. The application logs:
- Authentication events
- Cross-tab communication events
- Session validation results
- Error messages

## Future Enhancements

1. **Real-time Session Monitoring**
   - Use WebSocket or Server-Sent Events for real-time updates
   - Better handling of network disconnections

2. **Session Conflict Resolution**
   - Handle cases where user logs in with different accounts in different tabs
   - Implement session priority system

3. **Enhanced Security**
   - Implement session fingerprinting
   - Add device-based session management
   - Enhance session timeout handling