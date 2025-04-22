
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';
import { useAppointmentQueries } from './queries/useAppointmentQueries';
import { useAppointmentMutations } from './mutations/useAppointmentMutations';

export const useAppointments = (selectedDate?: Date | null, doctorId?: string | null) => {
  const { activeClinic } = useClinic();
  const queryClient = useQueryClient();
  const clinicId = activeClinic?.id;

  const {
    appointments,
    monthAppointments,
    allAppointments,
    isLoading,
    error,
    refetch
  } = useAppointmentQueries(clinicId, selectedDate, doctorId);

  const {
    createAppointment,
    confirmAppointment,
    cancelAppointment,
    updateAppointmentNotes,
    deleteAppointment
  } = useAppointmentMutations(clinicId);

  useEffect(() => {
    if (!clinicId) return;

    const channel = supabase
      .channel('appointment-changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `clinic_id=eq.${clinicId}`
        }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinicId, queryClient]);

  return {
    appointments,
    monthAppointments,
    allAppointments,
    isLoading,
    error,
    refetch,
    createAppointment,
    confirmAppointment,
    cancelAppointment,
    updateAppointmentNotes,
    deleteAppointment,
  };
};
