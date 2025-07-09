
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Patient } from '@/types';

export const usePatients = (clinicId?: string) => {
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId);
      
      if (error) {
        console.error('Erro ao buscar pacientes:', error);
        toast.error("Erro ao carregar pacientes");
        return [];
      }
      
      return data.map((patient: any) => ({
        id: patient.id,
        name: patient.name,
        email: patient.email || '',
        phone: patient.phone || '',
        birthDate: patient.birth_date,
        cpf: patient.cpf || '',
        created_at: patient.created_at,
        updated_at: patient.updated_at,
        clinic_id: patient.clinic_id,
        status: (patient.status as 'active' | 'inactive') || 'active',
        lastVisit: patient.last_visit
      }));
    },
    enabled: !!clinicId,
    refetchOnWindowFocus: true, // Allow refetching when window gets focus
    staleTime: 0, // Treat data as immediately stale to ensure fresh data
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes (was cacheTime in v4)
  });

  return {
    patients,
    isLoading,
  };
};
