import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export const PWAUpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateApplied, setUpdateApplied] = useState(false);

  useEffect(() => {
    // Check if user has disabled PWA update prompts
    const updatePromptsEnabled = localStorage.getItem('pwaUpdatePromptsEnabled');
    if (updatePromptsEnabled === 'false') {
      return;
    }

    // Detectar se há uma atualização disponível
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Verificar se o usuário não rejeitou recentemente (últimas 24 horas)
        const lastDismissed = localStorage.getItem('pwaUpdateLastDismissed');
        if (lastDismissed) {
          const hoursSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60);
          if (hoursSinceDismissed < 24) {
            return; // Não mostrar novamente por 24 horas
          }
        }
        
        setUpdateAvailable(true);
        // Delay de 3 segundos para ser menos invasivo
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      });

      // Verificar se já há um service worker esperando
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          const lastDismissed = localStorage.getItem('pwaUpdateLastDismissed');
          if (lastDismissed) {
            const hoursSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60);
            if (hoursSinceDismissed < 24) {
              return;
            }
          }
          
          setUpdateAvailable(true);
          setTimeout(() => {
            setShowPrompt(true);
          }, 3000);
        }
      });
    }
  }, []);

  const close = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaUpdateLastDismissed', Date.now().toString());
  };

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          setUpdateApplied(true);
          
          // Mostrar toast de sucesso
          toast.success('Atualização aplicada com sucesso!', {
            description: 'A nova versão será carregada na próxima vez que você abrir o aplicativo.',
            duration: 5000,
          });
        }
      });
    }
    setShowPrompt(false);
  };

  // Não mostrar se não há atualização ou se foi rejeitado recentemente
  if (!showPrompt || !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 animate-in slide-in-from-top-2 max-w-xs">
      <Card className="bg-card border shadow-md">
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Atualização</p>
              <p className="text-xs text-muted-foreground">
                {updateApplied ? 'Atualização aplicada' : 'Nova versão disponível'}
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center space-x-1">
              {!updateApplied ? (
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  className="h-7 px-2 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Atualizar
                </Button>
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={close}
                className="h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 