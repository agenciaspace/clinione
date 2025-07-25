import { useEffect } from 'react';
import { User } from '@/types';

interface AuthEvent {
  type: 'login' | 'logout';
  user?: User;
  timestamp: number;
}

interface UseTabSyncAuthProps {
  onLogin: (user: User) => void;
  onLogout: () => void;
  currentUser: User | null;
}

export const useTabSyncAuth = ({ onLogin, onLogout, currentUser }: UseTabSyncAuthProps) => {
  const broadcastAuthEvent = (event: AuthEvent) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('clinio_auth_event', JSON.stringify(event));
        
        // Clean up the event after broadcast to prevent stale events
        setTimeout(() => {
          localStorage.removeItem('clinio_auth_event');
        }, 2000);
      } catch (error) {
        console.error('Error broadcasting auth event:', error);
      }
    }
  };

  const broadcastLogin = (user: User) => {
    broadcastAuthEvent({ type: 'login', user, timestamp: Date.now() });
  };

  const broadcastLogout = () => {
    broadcastAuthEvent({ type: 'logout', timestamp: Date.now() });
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'clinio_auth_event' && e.newValue) {
        try {
          const authEvent: AuthEvent = JSON.parse(e.newValue);
          
          // Ignore events older than 5 seconds to prevent stale events
          if (Date.now() - authEvent.timestamp > 5000) {
            return;
          }
          
          console.log('Cross-tab auth event received:', authEvent);
          
          if (authEvent.type === 'logout') {
            onLogout();
          } else if (authEvent.type === 'login' && authEvent.user) {
            // Only trigger login if we don't already have this user
            if (!currentUser || currentUser.id !== authEvent.user.id) {
              onLogin(authEvent.user);
            }
          }
        } catch (error) {
          console.error('Error processing auth event:', error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [onLogin, onLogout, currentUser]);

  return {
    broadcastLogin,
    broadcastLogout,
  };
};