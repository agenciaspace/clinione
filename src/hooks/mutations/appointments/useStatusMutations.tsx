import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { NotificationService } from '@/utils/notification-service';

export const useAppointmentStatusMutations = (clinicId: string | undefined) => {
  const queryClient = useQueryClient();

  const confirmAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success('Agendamento confirmado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Error confirming appointment:', error);
      toast.error('Erro ao confirmar agendamento');
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: async (id: string) => {
      // Buscar dados do agendamento antes de cancelar
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);
        
      if (error) throw error;

      // Enviar notificação de cancelamento
      try {
        if (appointment?.patient_email && clinicId) {
          // Buscar dados da clínica
          const { data: clinic } = await supabase
            .from('clinics')
            .select('*')
            .eq('id', clinicId)
            .single();

          // Buscar dados do médico se especificado
          let doctor = null;
          if (appointment.doctor_id) {
            const { data: doctorData } = await supabase
              .from('doctors')
              .select('*')
              .eq('id', appointment.doctor_id)
              .single();
            doctor = doctorData;
          }

          if (clinic) {
            await NotificationService.sendAppointmentCancellation(appointment, clinic, doctor);
          }
        }
      } catch (notificationError) {
        console.error('Erro ao enviar notificação de cancelamento:', notificationError);
        // Não interromper o fluxo se falhar o envio da notificação
      }

      return id;
    },
    onSuccess: () => {
      toast.success('Agendamento cancelado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Error cancelling appointment:', error);
      toast.error('Erro ao cancelar agendamento');
    },
  });

  return {
    confirmAppointment: confirmAppointment.mutate,
    cancelAppointment: cancelAppointment.mutate,
  };
};
