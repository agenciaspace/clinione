
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useAppointmentNotes = () => {
  const queryClient = useQueryClient();

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
    updateAppointmentNotes: (id: string, notes: string) => 
      updateAppointmentNotes.mutate({ id, notes }),
  };
};
