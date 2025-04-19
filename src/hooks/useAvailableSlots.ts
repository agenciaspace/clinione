
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AvailableSlot {
  start_time: string;
  end_time: string;
  doctor_id: string;
  doctor_name: string;
}

export const useAvailableSlots = (clinicId: string, date: Date | undefined) => {
  const { data: slots, isLoading } = useQuery({
    queryKey: ['available-slots', clinicId, date?.toISOString()],
    queryFn: async () => {
      if (!date) return [];
      
      const { data, error } = await supabase
        .rpc('get_available_slots', {
          p_clinic_id: clinicId,
          p_date: date.toISOString().split('T')[0],
        });

      if (error) throw error;
      return data as AvailableSlot[];
    },
    enabled: !!clinicId && !!date,
  });

  return {
    slots: slots || [],
    isLoading,
  };
};
