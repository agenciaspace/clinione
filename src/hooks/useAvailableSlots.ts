
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
      if (!date) {
        console.log('Nenhuma data fornecida para buscar slots');
        return [];
      }
      
      console.log('Buscando slots disponíveis para a clínica:', clinicId, 'na data:', date.toISOString());
      
      // Garantir que estamos usando apenas a data sem o horário
      const formattedDate = date.toISOString().split('T')[0];
      
      try {
        // Primeiro, verificar se a clínica tem working_hours configurados
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .select('working_hours')
          .eq('id', clinicId)
          .single();
          
        if (clinicError) {
          console.error('Erro ao buscar dados da clínica:', clinicError);
          if (clinicError.code === 'PGRST116') {
            console.log('Clínica não encontrada');
            return [];
          }
          throw new Error(`Erro ao carregar dados da clínica: ${clinicError.message}`);
        }
          
        if (!clinicData?.working_hours) {
          console.log('Clínica não possui horários de funcionamento configurados');
          return [];
        }
        
        // Verificar se há horários para o dia da semana
        const dayOfWeek = new Date(formattedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const dayHours = clinicData.working_hours[dayOfWeek];
        
        console.log(`Working hours para ${dayOfWeek}:`, dayHours);
        
        if (!dayHours || dayHours.length === 0) {
          console.log(`Clínica fechada em ${dayOfWeek}`);
          return [];
        }
        
        // Verificar se há médicos cadastrados
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select('id, name')
          .eq('clinic_id', clinicId);
          
        if (doctorsError) {
          console.error('Erro ao buscar médicos:', doctorsError);
          throw new Error(`Erro ao carregar médicos: ${doctorsError.message}`);
        }
        
        if (!doctorsData || doctorsData.length === 0) {
          console.log('Nenhum médico cadastrado para esta clínica');
          return [];
        }
        
        console.log(`Encontrados ${doctorsData.length} médicos para a clínica`);
        
        // Buscar os horários disponíveis usando a função get_available_slots
        const { data, error } = await supabase.rpc('get_available_slots', {
          p_clinic_id: clinicId,
          p_date: formattedDate,
        });

        if (error) {
          console.error('Erro detalhado ao buscar slots disponíveis:', error);
          throw new Error(`Erro ao carregar horários: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          console.log('Nenhum slot disponível encontrado para a data:', formattedDate);
          return [];
        }
        
        console.log('Slots disponíveis encontrados:', data.length, 'slots para', formattedDate);
        console.log('Primeiros slots:', data.slice(0, 3));
        
        return data as AvailableSlot[];
      } catch (err: any) {
        console.error('Erro inesperado ao buscar horários disponíveis:', err);
        
        // Mostrar toast apenas para erros relevantes
        if (err.message && !err.message.includes('não encontrada')) {
          toast.error('Não foi possível carregar os horários disponíveis');
        }
        
        return [];
      }
    },
    enabled: !!clinicId && !!date,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para erros de dados não encontrados
      if (error?.message?.includes('não encontrada') || error?.code === 'PGRST116') {
        return false;
      }
      // Tentar novamente até 2 vezes para outros erros
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: 30000, // Cache por 30 segundos
    gcTime: 60000, // Manter no cache por 1 minuto
  });

  return {
    slots: slots || [],
    isLoading,
    error,
    refetch
  };
};
