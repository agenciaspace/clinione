
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { endOfMonth, startOfMonth } from 'date-fns';

export const useAppointmentQueries = (
  clinicId: string | undefined,
  selectedDate: Date | null | undefined,
  doctorId: string | null | undefined
) => {
  const fetchAppointments = async () => {
    if (!clinicId || !selectedDate) return [];

    const dateStart = new Date(selectedDate);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(selectedDate);
    dateEnd.setHours(23, 59, 59, 999);
    
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('date', dateStart.toISOString())
      .lte('date', dateEnd.toISOString());
      
    if (doctorId && doctorId !== 'all') {
      query = query.eq('doctor_id', doctorId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    console.log(`Agendamentos para ${dateStart.toISOString()}:`, data?.length || 0);
    return data as Appointment[];
  };

  const fetchMonthAppointments = async (date: Date) => {
    if (!clinicId || !date) return [];

    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('date', monthStart.toISOString())
      .lte('date', monthEnd.toISOString());
      
    if (doctorId && doctorId !== 'all') {
      query = query.eq('doctor_id', doctorId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as Appointment[];
  };

  const fetchAllAppointments = async () => {
    if (!clinicId) return [];
    
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('date', { ascending: true });
      
    if (doctorId && doctorId !== 'all') {
      query = query.eq('doctor_id', doctorId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as Appointment[];
  };

  const {
    data: appointments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['appointments', clinicId, selectedDate?.toISOString(), doctorId],
    queryFn: fetchAppointments,
    enabled: !!clinicId && !!selectedDate,
  });

  const {
    data: monthAppointments = [],
  } = useQuery({
    queryKey: ['month-appointments', clinicId, selectedDate ? startOfMonth(selectedDate).toISOString() : null, doctorId],
    queryFn: () => selectedDate ? fetchMonthAppointments(selectedDate) : Promise.resolve([]),
    enabled: !!clinicId && !!selectedDate,
  });

  const {
    data: allAppointments = [],
    isLoading: isLoadingAll
  } = useQuery({
    queryKey: ['all-appointments', clinicId, doctorId],
    queryFn: fetchAllAppointments,
    enabled: !!clinicId,
  });

  return {
    appointments,
    monthAppointments,
    allAppointments,
    isLoading: isLoading || isLoadingAll,
    error,
    refetch,
  };
};
