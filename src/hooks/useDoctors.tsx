
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';

export const useDoctors = () => {
  const { activeClinic } = useClinic();

  const fetchDoctors = async () => {
    if (!activeClinic?.id) return [];

    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('clinic_id', activeClinic.id)
      .order('name');

    if (error) throw error;
    return data;
  };

  const {
    data: doctors = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['doctors', activeClinic?.id],
    queryFn: fetchDoctors,
    enabled: !!activeClinic?.id,
  });

  return {
    doctors,
    isLoading,
    error
  };
};
