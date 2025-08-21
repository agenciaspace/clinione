import { useState, useEffect, useCallback, useRef } from 'react';

interface FormPersistenceOptions<T> {
  key: string;
  initialValues: T;
  maxAge?: number; // em milissegundos, padrão: 1 hora
  autoSaveDelay?: number; // delay para auto-save, padrão: 1 segundo
  onRestore?: (data: T) => void;
  onAutoSave?: (data: T) => void;
}

export const useFormPersistence = <T extends Record<string, any>>({
  key,
  initialValues,
  maxAge = 60 * 60 * 1000, // 1 hora
  autoSaveDelay = 1000, // 1 segundo
  onRestore,
  onAutoSave
}: FormPersistenceOptions<T>) => {
  const [formData, setFormData] = useState<T>(initialValues);
  const [isDirty, setIsDirty] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  const storageKey = `form_${key}`;

  // Carregar dados persistidos na inicialização
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        const now = Date.now();
        
        // Verificar se os dados não expiraram
        if (now - timestamp < maxAge) {
          setFormData(data);
          setIsDirty(true);
          onRestore?.(data);
        } else {
          // Limpar dados expirados
          sessionStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
      sessionStorage.removeItem(storageKey);
    }
    isInitialMount.current = false;
  }, [storageKey, maxAge, onRestore]);

  // Auto-save com debounce
  useEffect(() => {
    if (isInitialMount.current) return;

    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Configurar novo timeout para auto-save
    timeoutRef.current = setTimeout(() => {
      try {
        const dataToSave = {
          data: formData,
          timestamp: Date.now()
        };
        sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));
        onAutoSave?.(formData);
      } catch (error) {
        console.error('Erro ao fazer auto-save do formulário:', error);
      }
    }, autoSaveDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, storageKey, autoSaveDelay, onAutoSave]);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  }, []);

  const updateForm = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    setIsDirty(true);
  }, []);

  const resetForm = useCallback((newValues?: T) => {
    const valuesToUse = newValues || initialValues;
    setFormData(valuesToUse);
    setIsDirty(false);
    
    // Limpar dados persistidos
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Erro ao limpar dados do formulário:', error);
    }
  }, [initialValues, storageKey]);

  const clearPersistedData = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
      setIsDirty(false);
    } catch (error) {
      console.error('Erro ao limpar dados persistidos:', error);
    }
  }, [storageKey]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    // Processar diferentes tipos de input
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    }
    
    updateField(name as keyof T, processedValue);
  }, [updateField]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    formData,
    isDirty,
    updateField,
    updateForm,
    resetForm,
    clearPersistedData,
    handleInputChange,
    setFormData
  };
};
