
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useAppointmentMutations = (clinicId: string | undefined) => {
  const queryClient = useQueryClient();

  const createAppointment = useMutation({
    mutationFn: async ({
      patient_name,
      doctor_id,
      doctor_name,
      date,
      time,
      type,
      notes
    }: {
      patient_name: string;
      doctor_id?: string;
      doctor_name?: string;
      date: Date;
      time: string;
      type: 'in-person' | 'online';
      notes?: string;
    }) => {
      if (!clinicId) throw new Error('Nenhuma clínica selecionada');
      
      const [hours, minutes] = time.split(':').map(Number);
      const appointmentDate = new Date(date);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          clinic_id: clinicId,
          patient_name,
          doctor_id,
          doctor_name,
          date: appointmentDate.toISOString(),
          type,
          notes,
          status: 'scheduled'
        })
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Agendamento criado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao criar agendamento');
    },
  });

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
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);
        
      if (error) throw error;
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

  const updateAppointmentNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ notes })
        .eq('id', id);
        
      if (error) throw error;
      return { id, notes };
    },
    onSuccess: () => {
      toast.success('Observações atualizadas com sucesso');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Error updating appointment notes:', error);
      toast.error('Erro ao atualizar observações');
    },
  });

  return {
    createAppointment: createAppointment.mutate,
    confirmAppointment: confirmAppointment.mutate,
    cancelAppointment: cancelAppointment.mutate,
    updateAppointmentNotes: (id: string, notes: string) => 
      updateAppointmentNotes.mutate({ id, notes }),
  };
};
