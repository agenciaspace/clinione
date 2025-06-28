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

  // Enhanced function to detect if PWA is already installed
  const detectPWAInstallation = (): boolean => {
    // Method 1: Check display mode (most reliable)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Method 2: Check if running in standalone mode (iOS Safari)
    if ((window.navigator as any).standalone === true) {
      return true;
    }

    // Method 3: Check if launched from home screen (Android)
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return true;
    }

    // Method 4: Check user agent for WebView indicators
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('wv') || userAgent.includes('webview')) {
      return true;
    }

    // Method 5: Check if beforeinstallprompt was never fired (may indicate installed)
    const hasNeverSeenPrompt = !localStorage.getItem('hasSeenInstallPrompt') && 
                               !localStorage.getItem('pwaInstallPromptShown');

    // Method 6: Check if app was previously installed (custom tracking)
    if (localStorage.getItem('pwaInstalled') === 'true') {
      return true;
    }

    return false;
  };

  useEffect(() => {
    // Enhanced installation detection
    const isPWAInstalled = detectPWAInstallation();
    if (isPWAInstalled) {
      setIsInstalled(true);
      // Mark as installed in localStorage for future checks
      localStorage.setItem('pwaInstalled', 'true');
      return;
    }

    // Check if user has dismissed the prompt recently (within 7 days)
    const lastDismissed = localStorage.getItem('pwaPromptLastDismissed');
    if (lastDismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show prompt again within 7 days
      }
    }

    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // For iOS, check if user has seen the prompt recently
      const hasSeenIOSPrompt = localStorage.getItem('hasSeenIOSInstallPrompt');
      const lastIOSPrompt = localStorage.getItem('iosPromptLastShown');
      
      if (!hasSeenIOSPrompt || (lastIOSPrompt && (Date.now() - parseInt(lastIOSPrompt)) > 7 * 24 * 60 * 60 * 1000)) {
        setTimeout(() => {
          setShowInstallPrompt(true);
          localStorage.setItem('iosPromptLastShown', Date.now().toString());
        }, 3000);
      }
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay, but respect user's previous dismissals
      const hasSeenPrompt = localStorage.getItem('hasSeenInstallPrompt');
      const promptCount = parseInt(localStorage.getItem('pwaPromptCount') || '0');
      
      // Don't show more than 3 times total, and respect dismissal period
      if (!hasSeenPrompt && promptCount < 3) {
        setTimeout(() => {
          setShowInstallPrompt(true);
          localStorage.setItem('pwaPromptShown', 'true');
          localStorage.setItem('pwaPromptCount', (promptCount + 1).toString());
        }, 5000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      localStorage.setItem('pwaInstalled', 'true');
      localStorage.setItem('hasSeenInstallPrompt', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
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
        localStorage.setItem('pwaInstalled', 'true');
      } else {
        // User dismissed the native prompt
        localStorage.setItem('pwaPromptLastDismissed', Date.now().toString());
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
    localStorage.setItem('pwaPromptLastDismissed', Date.now().toString());
  };

  // Don't show if already installed or user has dismissed recently
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