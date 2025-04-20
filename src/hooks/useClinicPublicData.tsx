
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { WorkingHours } from '@/types';

const defaultWorkingHours: WorkingHours = {
  monday: [{ start: '08:00', end: '18:00' }],
  tuesday: [{ start: '08:00', end: '18:00' }],
  wednesday: [{ start: '08:00', end: '18:00' }],
  thursday: [{ start: '08:00', end: '18:00' }],
  friday: [{ start: '08:00', end: '18:00' }],
  saturday: [{ start: '08:00', end: '13:00' }],
  sunday: []
};

export interface ClinicData {
  id: string;
  name: string;
  logo: string | null;
  photo: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  working_hours: WorkingHours | null;
  slug: string | null;
  is_published: boolean | null;
}

export const useClinicPublicData = (slug?: string, selectedClinicId?: string | null, isPreview: boolean = false) => {
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableClinics, setAvailableClinics] = useState<{ id: string; name: string }[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  // Fetch available clinics in preview mode
  useEffect(() => {
    if (isPreview) {
      const fetchAvailableClinics = async () => {
        try {
          const { data, error } = await supabase
            .from('clinics')
            .select('id, name')
            .order('name');
            
          if (error) {
            console.error("Erro ao buscar clínicas:", error);
            return;
          }
          
          if (data) {
            setAvailableClinics(data);
          }
        } catch (error) {
          console.error("Erro:", error);
        }
      };
      
      fetchAvailableClinics();
    }
  }, [isPreview]);

  // Fetch clinic data
  useEffect(() => {
    const fetchClinicData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let clinicQuery;
        
        if (isPreview) {
          if (selectedClinicId) {
            console.log("Buscando clínica por ID no modo preview:", selectedClinicId);
            clinicQuery = await supabase
              .from('clinics')
              .select('*')
              .eq('id', selectedClinicId)
              .single();
          } else {
            console.log("Buscando primeira clínica no modo preview");
            clinicQuery = await supabase
              .from('clinics')
              .select('*')
              .limit(1)
              .single();
          }
          
          if (clinicQuery.error && clinicQuery.error.code !== 'PGRST116') {
            throw clinicQuery.error;
          }
          
          if (!clinicQuery.data) {
            throw new Error("Nenhuma clínica encontrada. Por favor, crie uma clínica primeiro.");
          }
        } else if (slug) {
          console.log("Buscando clínica pelo slug na URL pública:", slug);
          clinicQuery = await supabase
            .from('clinics')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .maybeSingle();
            
          if (clinicQuery.error) {
            throw new Error("Página da clínica não encontrada ou não publicada");
          }
          
          if (!clinicQuery.data) {
            throw new Error("Página da clínica não encontrada");
          }
        } else {
          throw new Error("Nenhum slug fornecido");
        }
        
        const clinicData = clinicQuery.data;
        console.log("Dados da clínica recuperados:", clinicData);
        
        let workingHoursData = defaultWorkingHours;
        if (clinicData.working_hours && typeof clinicData.working_hours === 'object') {
          workingHoursData = clinicData.working_hours as WorkingHours;
        }
        
        setClinic({
          ...clinicData,
          working_hours: workingHoursData,
        });

        // Fetch doctors for the clinic
        if (clinicData.id) {
          console.log("Buscando médicos para a clínica:", clinicData.id);
          const { data: doctorsData, error: doctorsError } = await supabase
            .from('doctors')
            .select('id, name, speciality, bio, phone, email, photo_url')
            .eq('clinic_id', clinicData.id);
            
          if (doctorsError) {
            console.error("Erro ao buscar médicos:", doctorsError);
          } else {
            console.log("Dados dos médicos recuperados:", doctorsData);
            setDoctors(doctorsData || []);
          }
        }
      } catch (error: any) {
        console.error("Erro:", error);
        setError(isPreview 
          ? "Nenhuma clínica encontrada. Por favor, crie uma clínica primeiro." 
          : error.message || "Página não encontrada ou não publicada."
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClinicData();
  }, [slug, isPreview, selectedClinicId]);

  return {
    clinic,
    doctors,
    isLoading,
    error,
    availableClinics
  };
};
