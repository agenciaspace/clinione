
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success('Agendamento excluído com sucesso');
      // Invalidar todas as queries relacionadas a agendamentos para garantir atualização completa
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['month-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['all-appointments'] });
    },
    onError: (error) => {
      console.error('Error deleting appointment:', error);
      toast.error('Erro ao excluir agendamento');
    },
  });

  return {
    deleteAppointment: mutation.mutate,
    isDeleting: mutation.isPending,
  };
};
