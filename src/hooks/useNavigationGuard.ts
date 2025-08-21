import { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationGuardOptions {
  shouldBlock?: () => boolean;
  message?: string;
  onBeforeUnload?: () => void;
  onNavigationAttempt?: (targetLocation: string) => boolean;
}

export const useNavigationGuard = ({
  shouldBlock = () => false,
  message = 'Você tem alterações não salvas. Deseja realmente sair?',
  onBeforeUnload,
  onNavigationAttempt
}: NavigationGuardOptions = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isBlockingRef = useRef(false);

  // Prevenir fechamento/recarregamento da página
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlock()) {
        onBeforeUnload?.();
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldBlock, message, onBeforeUnload]);

  // Prevenir navegação programática
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (shouldBlock()) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          // Restaurar o estado anterior
          window.history.pushState(null, '', location.pathname + location.search);
          e.preventDefault();
          return;
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock, message, location]);

  const safeNavigate = useCallback((to: string, options?: any) => {
    if (shouldBlock()) {
      const shouldProceed = onNavigationAttempt?.(to) ?? window.confirm(message);
      if (!shouldProceed) {
        return;
      }
    }
    navigate(to, options);
  }, [shouldBlock, message, navigate, onNavigationAttempt]);

  const clearGuard = useCallback(() => {
    isBlockingRef.current = false;
  }, []);

  const setGuard = useCallback(() => {
    isBlockingRef.current = true;
  }, []);

  return {
    safeNavigate,
    clearGuard,
    setGuard,
    isBlocking: isBlockingRef.current
  };
};
