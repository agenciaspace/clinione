import { useState, useEffect, useCallback } from 'react';

interface ModalState {
  isOpen: boolean;
  data?: any;
  timestamp: number;
}

interface ModalPersistenceOptions {
  key: string;
  maxAge?: number; // em milissegundos, padrão: 30 minutos
  onRestore?: (data: any) => void;
}

export const useModalPersistence = <T = any>({
  key,
  maxAge = 30 * 60 * 1000, // 30 minutos
  onRestore
}: ModalPersistenceOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const storageKey = `modal_${key}`;

  // Carregar estado persistido na inicialização
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const modalState: ModalState = JSON.parse(stored);
        const now = Date.now();
        
        // Verificar se o estado não expirou
        if (now - modalState.timestamp < maxAge) {
          setIsOpen(modalState.isOpen);
          if (modalState.data) {
            setData(modalState.data);
            onRestore?.(modalState.data);
          }
        } else {
          // Limpar estado expirado
          sessionStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar estado do modal:', error);
      sessionStorage.removeItem(storageKey);
    }
  }, [storageKey, maxAge, onRestore]);

  // Persistir estado quando mudar
  const persistState = useCallback((newIsOpen: boolean, newData?: T) => {
    try {
      if (newIsOpen || newData) {
        const modalState: ModalState = {
          isOpen: newIsOpen,
          data: newData,
          timestamp: Date.now()
        };
        sessionStorage.setItem(storageKey, JSON.stringify(modalState));
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error('Erro ao persistir estado do modal:', error);
    }
  }, [storageKey]);

  const openModal = useCallback((modalData?: T) => {
    setIsOpen(true);
    if (modalData !== undefined) {
      setData(modalData);
    }
    persistState(true, modalData);
  }, [persistState]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setData(null);
    persistState(false);
  }, [persistState]);

  const updateData = useCallback((newData: T) => {
    setData(newData);
    persistState(isOpen, newData);
  }, [isOpen, persistState]);

  // Limpar estado ao desmontar
  useEffect(() => {
    return () => {
      // Não limpar automaticamente - deixar para expirar naturalmente
      // Isso permite que o estado persista entre navegações
    };
  }, []);

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    updateData,
    setIsOpen: (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        setData(null);
        persistState(false);
      }
    }
  };
};
