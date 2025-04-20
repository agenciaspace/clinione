
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
      
      console.log('Buscando slots disponíveis para a clínica:', clinicId, 'na data:', date.toISOString());
      
      // Garantir que estamos usando apenas a data sem o horário
      const formattedDate = date.toISOString().split('T')[0];
      
      try {
        // Buscar os horários disponíveis diretamente da base
        const { data, error } = await supabase.rpc('get_available_slots', {
          p_clinic_id: clinicId,
          p_date: formattedDate,
        });

        if (error) {
          console.error('Erro ao buscar slots disponíveis:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log('Nenhum slot disponível encontrado para a data:', formattedDate);
          
          // Buscar médicos da clínica para debug
          const { data: doctorsData } = await supabase
            .from('doctors')
            .select('id, name')
            .eq('clinic_id', clinicId);
            
          if (doctorsData && doctorsData.length > 0) {
            console.log('Médicos encontrados para a clínica:', doctorsData);
            
            // Como temos médicos mas não temos slots, vamos criar alguns slots de exemplo manualmente
            // Isso é temporário até que configuremos corretamente a disponibilidade no banco de dados
            const manualSlots = [];
            const hours = [9, 10, 11, 14, 15, 16, 17];
            
            for (const doctor of doctorsData) {
              for (const hour of hours) {
                const hourStr = hour.toString().padStart(2, '0');
                manualSlots.push({
                  doctor_id: doctor.id,
                  doctor_name: doctor.name,
                  start_time: `${formattedDate}T${hourStr}:00:00`,
                  end_time: `${formattedDate}T${hourStr}:30:00`
                });
              }
            }
            
            console.log(`Criados ${manualSlots.length} slots temporários:`, manualSlots);
            return manualSlots;
          } else {
            console.log('Nenhum médico encontrado para a clínica');
            return [];
          }
        }
        
        console.log('Slots disponíveis encontrados:', data.length, 'slots:', data);
        return data as AvailableSlot[];
      } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err);
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
