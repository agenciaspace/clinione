import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface AutoSaveOptions {
  key: string; // Unique key for localStorage
  data: any; // Data to save
  saveToCloud?: (data: any) => Promise<void>; // Optional cloud save function
  autoSaveDelay?: number; // Delay in ms before auto-saving (default: 2000)
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export const useAutoSave = ({
  key,
  data,
  saveToCloud,
  autoSaveDelay = 2000,
  onSaveSuccess,
  onSaveError
}: AutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const isInitialMount = useRef(true);

  // Save to localStorage immediately
  const saveToLocalStorage = useCallback((dataToSave: any) => {
    try {
      const serializedData = JSON.stringify({
        data: dataToSave,
        timestamp: Date.now(),
        version: '1.0'
      });
      localStorage.setItem(`autosave_${key}`, serializedData);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key]);

  // Load from localStorage
  const loadFromLocalStorage = useCallback((): any | null => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.data;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return null;
  }, [key]);

  // Clear localStorage
  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
  }, [key]);

  // Auto-save logic
  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const currentDataString = JSON.stringify(data);
    
    // Only save if data has changed
    if (currentDataString === lastSavedRef.current) {
      return;
    }

    // Save to localStorage immediately
    saveToLocalStorage(data);

    // Set timeout for cloud save
    timeoutRef.current = setTimeout(async () => {
      try {
        // Save to cloud if function provided
        if (saveToCloud && data) {
          await saveToCloud(data);
          onSaveSuccess?.();
        }
        
        lastSavedRef.current = currentDataString;
      } catch (error) {
        console.error('Auto-save error:', error);
        onSaveError?.(error as Error);
      }
    }, autoSaveDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, autoSaveDelay, saveToCloud, saveToLocalStorage, onSaveSuccess, onSaveError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loadFromLocalStorage,
    clearLocalStorage,
    saveToLocalStorage
  };
};