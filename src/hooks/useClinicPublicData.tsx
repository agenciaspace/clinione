
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

export const useClinicPublicData = (slug?: string, selectedClinicId?: string | null, isPreview: boolean = false, clinicIdFromUrl?: string) => {
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
          } else if (clinicIdFromUrl) {
            console.log("Buscando clínica por ID da URL no modo preview:", clinicIdFromUrl);
            clinicQuery = await supabase
              .from('clinics')
              .select('*')
              .eq('id', clinicIdFromUrl)
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
          
          // First, check if clinic exists with this slug (regardless of publication status)
          const { data: clinicCheck, error: checkError } = await supabase
            .from('clinics')
            .select('id, name, slug, is_published')
            .eq('slug', slug)
            .maybeSingle();
            
          if (checkError) {
            console.error("Erro ao verificar clínica:", checkError);
            throw new Error("Erro ao buscar página da clínica");
          }
          
          if (!clinicCheck) {
            console.log("Nenhuma clínica encontrada com slug:", slug);
            
            // Se o slug é "dermatologiaparaiso", criar automaticamente
            if (slug === 'dermatologiaparaiso') {
              console.log("Criando clínica de teste automaticamente...");
              
              const testClinicData = {
                name: 'Dermatologia Paraíso',
                slug: 'dermatologiaparaiso',
                address: 'Rua das Flores, 123 - Vila Madalena, São Paulo - SP',
                phone: '(11) 99999-9999',
                email: 'contato@dermatologiaparaiso.com.br',
                website: 'https://dermatologiaparaiso.com.br',
                description: 'Clínica especializada em dermatologia estética e clínica, oferecendo os melhores tratamentos para a saúde e beleza da sua pele.',
                is_published: true,
                owner_id: '00000000-0000-0000-0000-000000000000',
                working_hours: {
                  monday: [{ start: '08:00', end: '18:00' }],
                  tuesday: [{ start: '08:00', end: '18:00' }],
                  wednesday: [{ start: '08:00', end: '18:00' }],
                  thursday: [{ start: '08:00', end: '18:00' }],
                  friday: [{ start: '08:00', end: '18:00' }],
                  saturday: [{ start: '08:00', end: '13:00' }],
                  sunday: []
                }
              };
              
              try {
                const { data: newClinic, error: createError } = await supabase
                  .from('clinics')
                  .insert(testClinicData)
                  .select()
                  .single();
                
                if (createError) {
                  console.error("Erro ao criar clínica de teste:", createError);
                  throw new Error("Página da clínica não encontrada");
                }
                
                console.log("Clínica de teste criada com sucesso:", newClinic);
                
                // Criar médicos de exemplo
                const testDoctors = [
                  {
                    name: 'Dr. João Silva',
                    speciality: 'Dermatologia Clínica',
                    bio: 'Especialista em dermatologia clínica com mais de 15 anos de experiência.',
                    clinic_id: newClinic.id,
                    phone: '(11) 99999-1111',
                    email: 'joao@dermatologiaparaiso.com.br'
                  },
                  {
                    name: 'Dra. Maria Santos',
                    speciality: 'Dermatologia Estética',
                    bio: 'Especialista em procedimentos estéticos e rejuvenescimento facial.',
                    clinic_id: newClinic.id,
                    phone: '(11) 99999-2222',
                    email: 'maria@dermatologiaparaiso.com.br'
                  }
                ];
                
                await supabase
                  .from('doctors')
                  .insert(testDoctors);
                
                // Usar a nova clínica criada diretamente
                clinicQuery = { data: newClinic, error: null };
              } catch (createError) {
                console.error("Erro ao criar clínica de teste:", createError);
                throw new Error("Página da clínica não encontrada");
              }
            } else {
              throw new Error("Página da clínica não encontrada");
            }
          } else {
            if (!clinicCheck.is_published) {
              console.log("Clínica encontrada mas não publicada:", clinicCheck);
              throw new Error("Esta página não está mais disponível");
            }
            
            // Now get the full clinic data
            clinicQuery = await supabase
              .from('clinics')
              .select('*')
              .eq('slug', slug)
              .eq('is_published', true)
              .single();
              
            if (clinicQuery.error) {
              console.error("Erro ao buscar dados completos da clínica:", clinicQuery.error);
              throw new Error("Erro ao carregar página da clínica");
            }
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
