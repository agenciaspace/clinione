
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
    // First clean up any existing webhook channel before attempting to create a new one
    if (webhookChannel) {
      try {
        console.log('[WEBHOOK] Removendo canal webhook anterior');
        supabase.removeChannel(webhookChannel);
      } catch (e) {
        console.error('Erro ao remover canal webhook:', e);
      } finally {
        setWebhookChannel(null);
      }
    }
    
    // Only setup a new channel if we have an active clinic
    if (activeClinic?.id) {
      // Use a delay to avoid race conditions with channel setup/teardown
      const setupTimer = setTimeout(() => {
        console.log(`[WEBHOOK] Configurando novo canal webhook para clínica ${activeClinic.id}`);
        try {
          // Get all existing channels
          const existingChannels = supabase.getChannels();
          
          // Create a unique channel name with timestamp to avoid collisions
          const channelName = `webhook-${activeClinic.id}-${Date.now()}`;
          
          // Remove any webhook channels for this clinic to prevent duplicates
          existingChannels.forEach(ch => {
            if (ch.topic && ch.topic.startsWith(`webhook-${activeClinic.id}`)) {
              console.log('[WEBHOOK] Removendo canal existente com nome similar:', ch.topic);
              try {
                supabase.removeChannel(ch);
              } catch (e) {
                console.error('Erro ao remover canal existente:', e);
              }
            }
          });
          
          // Create the new channel with the unique name
          const channel = setupWebhookRealtimeListeners(activeClinic.id, channelName);
          
          if (channel) {
            setWebhookChannel(channel);
          }
        } catch (error) {
          console.error('[WEBHOOK] Erro ao configurar canal webhook:', error);
        }
      }, 800); // Increased delay to ensure cleanup has completed
      
      return () => {
        clearTimeout(setupTimer);
      };
    }
    
    return () => {
      if (webhookChannel) {
        try {
          console.log('[WEBHOOK] Cleanup: Removendo canal webhook ao desmontar');
          supabase.removeChannel(webhookChannel);
        } catch (e) {
          console.error('Erro ao remover canal webhook durante limpeza:', e);
        }
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
