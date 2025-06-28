import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // For iOS, we'll show instructions instead of a button
      const hasSeenIOSPrompt = localStorage.getItem('hasSeenIOSInstallPrompt');
      if (!hasSeenIOSPrompt) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay
      const hasSeenPrompt = localStorage.getItem('hasSeenInstallPrompt');
      if (!hasSeenPrompt) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        localStorage.setItem('hasSeenInstallPrompt', 'true');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('hasSeenInstallPrompt', 'true');
    localStorage.setItem('hasSeenIOSInstallPrompt', 'true');
  };

  if (!showInstallPrompt || isInstalled) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <Card className="bg-primary text-primary-foreground shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-base">
                Instale o Clini.One no seu dispositivo
              </h3>
              {isIOS ? (
                <div className="space-y-2">
                  <p className="text-sm opacity-90">
                    Para instalar no iOS:
                  </p>
                  <ol className="text-sm opacity-90 space-y-1 ml-4">
                    <li>1. Toque no botão compartilhar <span className="font-mono">⎙</span></li>
                    <li>2. Role e toque em "Adicionar à Tela de Início"</li>
                    <li>3. Toque em "Adicionar"</li>
                  </ol>
                </div>
              ) : (
                <p className="text-sm opacity-90">
                  Acesse rapidamente o sistema direto da sua tela inicial. 
                  Funciona offline e envia notificações importantes.
                </p>
              )}
            </div>
            <div className="flex-shrink-0 flex items-center space-x-2">
              {!isIOS && deferredPrompt && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleInstallClick}
                  className="bg-white text-primary hover:bg-gray-100"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Instalar
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDismiss}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 