import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  const updateSW = () => {
    updateServiceWorker(true);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <Card className="bg-primary text-primary-foreground shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5" />
              <div>
                <h3 className="font-semibold text-sm">
                  Nova versão disponível
                </h3>
                <p className="text-xs opacity-90">
                  Atualize para ter acesso às últimas melhorias
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={close}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                Depois
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={updateSW}
                className="bg-white text-primary hover:bg-gray-100"
              >
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 