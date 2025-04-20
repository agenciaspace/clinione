
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
      
      // Buscar os horários disponíveis diretamente da base
      try {
        const { data, error } = await supabase
          .rpc('get_available_slots', {
            p_clinic_id: clinicId,
            p_date: formattedDate,
          });

        if (error) {
          console.error('Erro ao buscar slots disponíveis:', error);
          throw error;
        }
        
        // Adicionar mais informações para debugging
        console.log('Resposta da função get_available_slots:', data);
        
        if (!data || data.length === 0) {
          console.log('Nenhum slot disponível encontrado para a data:', formattedDate);
          
          // Buscar horários de funcionamento da clínica para debug
          const { data: clinicData } = await supabase
            .from('clinics')
            .select('working_hours')
            .eq('id', clinicId)
            .single();
            
          if (clinicData?.working_hours) {
            console.log('Horários de funcionamento da clínica:', clinicData.working_hours);
          }
          
          // Buscar médicos da clínica para debug
          const { data: doctorsData } = await supabase
            .from('doctors')
            .select('id, name')
            .eq('clinic_id', clinicId);
            
          if (doctorsData && doctorsData.length > 0) {
            console.log('Médicos encontrados para a clínica:', doctorsData);
          } else {
            console.log('Nenhum médico encontrado para a clínica');
          }
        } else {
          console.log('Slots disponíveis encontrados:', data.length, 'slots:', data);
        }
        
        return data as AvailableSlot[];
      } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err);
        throw err;
      }
    },
    enabled: !!clinicId && !!date,
    retry: 3,
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
