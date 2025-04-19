
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AvailableSlot {
  start_time: string;
  end_time: string;
  doctor_id: string;
  doctor_name: string;
}

export const useAvailableSlots = (clinicId: string, date: Date | undefined) => {
  const { data: slots, isLoading, error, refetch } = useQuery({
    queryKey: ['available-slots', clinicId, date?.toISOString()],
    queryFn: async () => {
      if (!date) return [];
      
      console.log('Buscando slots disponíveis para a clínica:', clinicId, 'na data:', date.toISOString().split('T')[0]);
      
      // Garantir que estamos usando apenas a data sem o horário
      const formattedDate = date.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .rpc('get_available_slots', {
          p_clinic_id: clinicId,
          p_date: formattedDate,
        });

      if (error) {
        console.error('Erro ao buscar slots disponíveis:', error);
        throw error;
      }
      
      console.log('Slots disponíveis encontrados:', data?.length || 0, 'slots:', data);
      return data as AvailableSlot[];
    },
    enabled: !!clinicId && !!date,
  });

  return {
    slots: slots || [],
    isLoading,
    error,
    refetch
  };
};
