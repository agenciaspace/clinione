
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';
import { Clinic } from '@/types';

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

  const fetchClinics = async () => {
    if (!user) {
      setClinics([]);
      setActiveClinicState(null);
      setIsLoadingClinics(false);
      return;
    }

    setIsLoadingClinics(true);
    try {
      // Buscar clínicas onde o usuário é dono
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('owner_id', user.id);

      if (error) throw error;

      setClinics(data || []);
      
      // Verificar se há uma clínica ativa salva no localStorage
      const savedClinicId = localStorage.getItem('activeClinicId');
      
      if (savedClinicId && data?.length) {
        const savedClinic = data.find(clinic => clinic.id === savedClinicId);
        if (savedClinic) {
          setActiveClinicState(savedClinic);
        } else {
          // Se a clínica salva não estiver disponível, use a primeira
          setActiveClinicState(data[0]);
          localStorage.setItem('activeClinicId', data[0].id);
        }
      } else if (data?.length) {
        // Se não há clínica salva ou não há clínicas disponíveis, use a primeira
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
