
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';
import { Clinic } from '@/types';
import { setupWebhookRealtimeListeners } from '@/utils/webhook-service';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ClinicContextType {
  clinics: Clinic[];
  activeClinic: Clinic | null;
  setActiveClinic: (clinic: Clinic) => void;
  isLoadingClinics: boolean;
  refreshClinics: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType>({
  clinics: [],
  activeClinic: null,
  setActiveClinic: () => {},
  isLoadingClinics: true,
  refreshClinics: async () => {},
});

export const useClinic = () => useContext(ClinicContext);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [activeClinic, setActiveClinicState] = useState<Clinic | null>(null);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [webhookChannel, setWebhookChannel] = useState<RealtimeChannel | null>(null);

  const fetchClinics = async () => {
    if (!user) {
      setClinics([]);
      setActiveClinicState(null);
      setIsLoadingClinics(false);
      return;
    }

    setIsLoadingClinics(true);
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('owner_id', user.id);

      if (error) throw error;

      setClinics(data || []);
      
      const savedClinicId = localStorage.getItem('activeClinicId');
      
      if (savedClinicId && data?.length) {
        const savedClinic = data.find(clinic => clinic.id === savedClinicId);
        if (savedClinic) {
          setActiveClinicState(savedClinic);
        } else {
          setActiveClinicState(data[0]);
          localStorage.setItem('activeClinicId', data[0].id);
        }
      } else if (data?.length) {
        setActiveClinicState(data[0]);
        localStorage.setItem('activeClinicId', data[0].id);
      } else {
        setActiveClinicState(null);
      }
    } catch (error) {
      console.error("Erro ao buscar clínicas:", error);
      toast.error("Erro ao carregar clínicas");
    } finally {
      setIsLoadingClinics(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [user]);

  useEffect(() => {
    // Cleanup previous channel subscription if exists
    if (webhookChannel) {
      console.log('[WEBHOOK] Removing previous webhook channel');
      supabase.removeChannel(webhookChannel);
      setWebhookChannel(null);
    }
    
    if (activeClinic?.id) {
      console.log(`[WEBHOOK] Setting up new webhook channel for clinic ${activeClinic.id}`);
      const channel = setupWebhookRealtimeListeners(activeClinic.id);
      
      if (channel) {
        // Subscribe to the channel and implement reconnection logic
        channel.subscribe((status) => {
          console.log(`[WEBHOOK] Channel subscription status for clinic ${activeClinic.id}: ${status}`);
          
          if (status === 'SUBSCRIBED') {
            console.log('[WEBHOOK] Successfully subscribed to realtime webhook events');
            // Removed the success toast to prevent user confusion
          } else if (status === 'CHANNEL_ERROR') {
            console.error('[WEBHOOK] Error subscribing to webhook channel');
            toast.error('Erro na conexão de webhooks, tentando reconectar...');
            
            // Implement exponential backoff for retries
            let retryAttempt = 0;
            const maxRetries = 5;
            
            const attemptReconnection = () => {
              if (retryAttempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, retryAttempt), 30000);
                retryAttempt++;
                
                console.log(`[WEBHOOK] Attempting reconnection ${retryAttempt}/${maxRetries} in ${delay}ms`);
                
                setTimeout(() => {
                  console.log('[WEBHOOK] Attempting to resubscribe...');
                  channel.subscribe((newStatus) => {
                    if (newStatus === 'SUBSCRIBED') {
                      console.log('[WEBHOOK] Reconnection successful');
                      toast.success('Reconexão de webhooks bem-sucedida');
                      retryAttempt = 0;
                    } else if (newStatus === 'CHANNEL_ERROR' && retryAttempt < maxRetries) {
                      attemptReconnection();
                    } else {
                      console.error('[WEBHOOK] Max retry attempts reached');
                      toast.error('Não foi possível reconectar os webhooks');
                    }
                  });
                }, delay);
              }
            };
            
            attemptReconnection();
          }
        });
        
        setWebhookChannel(channel);
      }
    }
    
    return () => {
      if (webhookChannel) {
        console.log('[WEBHOOK] Cleanup: Removing webhook channel on unmount');
        supabase.removeChannel(webhookChannel);
      }
    };
  }, [activeClinic?.id]);

  const setActiveClinic = (clinic: Clinic) => {
    setActiveClinicState(clinic);
    localStorage.setItem('activeClinicId', clinic.id);
    toast.success(`Clínica ${clinic.name} selecionada`);
  };

  return (
    <ClinicContext.Provider
      value={{
        clinics,
        activeClinic,
        setActiveClinic,
        isLoadingClinics,
        refreshClinics: fetchClinics
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};
