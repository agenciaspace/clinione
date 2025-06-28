import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      toast.success('Conexão restaurada', {
        description: 'Você está online novamente',
        duration: 3000
      });
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
      toast.error('Sem conexão', {
        description: 'Você está offline. Algumas funcionalidades podem estar limitadas.',
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      <div className="flex items-center justify-center space-x-2">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Conexão restaurada</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Você está offline</span>
          </>
        )}
      </div>
    </div>
  );
} 