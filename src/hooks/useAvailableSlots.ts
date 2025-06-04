
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      
      console.log('Buscando slots disponíveis para a clínica:', clinicId, 'na data:', date.toISOString());
      
      // Garantir que estamos usando apenas a data sem o horário
      const formattedDate = date.toISOString().split('T')[0];
      
      try {
        // Buscar os working_hours da clínica para debug
        const { data: clinicData } = await supabase
          .from('clinics')
          .select('working_hours')
          .eq('id', clinicId)
          .single();
          
        if (clinicData?.working_hours) {
          // Corrigido: usar 'long' corretamente para obter o nome completo do dia
          const dayOfWeek = new Date(formattedDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          console.log(`Working hours para ${dayOfWeek}:`, clinicData.working_hours[dayOfWeek]);
        }
        
        // Buscar os horários disponíveis usando a função get_available_slots
        const { data, error } = await supabase.rpc('get_available_slots', {
          p_clinic_id: clinicId,
          p_date: formattedDate,
        });

        if (error) {
          console.error('Erro ao buscar slots disponíveis:', error);
          toast.error(`Erro ao carregar horários: ${error.message}`);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log('Nenhum slot disponível encontrado para a data:', formattedDate);
          return [];
        }
        
        console.log('Slots disponíveis encontrados:', data.length, 'slots:', data);
        return data as AvailableSlot[];
      } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err);
        toast.error('Não foi possível carregar os horários disponíveis');
        throw err;
      }
    },
    enabled: !!clinicId && !!date,
    retry: 1,
    retryDelay: 1000,
    staleTime: 0, // Não guardar cache dos horários
    gcTime: 0, 
  });

  return {
    slots: slots || [],
    isLoading,
    error,
    refetch
  };
};
