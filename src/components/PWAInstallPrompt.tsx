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
    // Check if user has disabled PWA install prompts
    const installPromptsEnabled = localStorage.getItem('pwaInstallPromptsEnabled');
    if (installPromptsEnabled === 'false') {
      return;
    }

    // Enhanced installation detection
    const isPWAInstalled = detectPWAInstallation();
    if (isPWAInstalled) {
      setIsInstalled(true);
      // Mark as installed in localStorage for future checks
      localStorage.setItem('pwaInstalled', 'true');
      return;
    }

    // Check if user has dismissed the prompt recently (within 30 days - less invasive)
    const lastDismissed = localStorage.getItem('pwaPromptLastDismissed');
    if (lastDismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 30) {
        return; // Don't show prompt again within 30 days
      }
    }

    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // For iOS, check if user has seen the prompt recently (increase to 30 days)
      const hasSeenIOSPrompt = localStorage.getItem('hasSeenIOSInstallPrompt');
      const lastIOSPrompt = localStorage.getItem('iosPromptLastShown');
      
      if (!hasSeenIOSPrompt || (lastIOSPrompt && (Date.now() - parseInt(lastIOSPrompt)) > 30 * 24 * 60 * 60 * 1000)) {
        // Increase delay to 10 seconds to be less invasive
        setTimeout(() => {
          setShowInstallPrompt(true);
          localStorage.setItem('iosPromptLastShown', Date.now().toString());
        }, 10000);
      }
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay, but respect user's previous dismissals
      const hasSeenPrompt = localStorage.getItem('hasSeenInstallPrompt');
      const promptCount = parseInt(localStorage.getItem('pwaPromptCount') || '0');
      
      // Don't show more than 2 times total (reduced from 3), and respect dismissal period
      if (!hasSeenPrompt && promptCount < 2) {
        // Increase delay to 15 seconds to be less invasive
        setTimeout(() => {
          setShowInstallPrompt(true);
          localStorage.setItem('pwaPromptShown', 'true');
          localStorage.setItem('pwaPromptCount', (promptCount + 1).toString());
        }, 15000);
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

  // NEW: Extra verification using getInstalledRelatedApps (Chrome / Edge)
  useEffect(() => {
    // Some browsers support querying related installed apps (including the current PWA)
    const checkRelatedApps = async () => {
      try {
        const nav: any = navigator as any;
        if (typeof nav.getInstalledRelatedApps === 'function') {
          const related = await nav.getInstalledRelatedApps();
          if (Array.isArray(related) && related.length > 0) {
            setIsInstalled(true);
            localStorage.setItem('pwaInstalled', 'true');
          }
        }
      } catch (error) {
        // Silently ignore – feature not available or other issue
        console.debug('getInstalledRelatedApps check failed', error);
      }
    };

    checkRelatedApps();
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
    // Tornar mais discreto - canto superior direito, menor
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 max-w-sm">
      <Card className="bg-card border shadow-md">
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-medium text-sm">
                Instalar App
              </h4>
              {isIOS ? (
                <p className="text-xs text-muted-foreground">
                  Toque em ⎙ → "Adicionar à Tela de Início"
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Acesse offline direto da tela inicial
                </p>
              )}
            </div>
            <div className="flex-shrink-0 flex items-center space-x-1">
              {!isIOS && deferredPrompt && (
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="h-7 px-2 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Instalar
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
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
} 