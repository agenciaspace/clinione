
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Patient } from '@/types';

export const usePatientMutations = (clinicId?: string) => {
  const queryClient = useQueryClient();

  const updatePatientMutation = useMutation({
    mutationFn: async (updatePatient: Patient) => {
      const { data, error } = await supabase
        .from('patients')
        .update({
          name: updatePatient.name,
          email: updatePatient.email,
          phone: updatePatient.phone,
          birth_date: updatePatient.birthDate,
          status: updatePatient.status
        })
        .eq('id', updatePatient.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', clinicId] });
      toast.success('Paciente atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao atualizar paciente:', error);
      toast.error('Erro ao atualizar paciente');
    }
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', clinicId] });
      toast.success('Paciente removido com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao remover paciente:', error);
      toast.error('Erro ao remover paciente');
    }
  });

  return {
    updatePatient: updatePatientMutation.mutate,
    deletePatient: deletePatientMutation.mutate,
    isUpdating: updatePatientMutation.isPending,
    isDeleting: deletePatientMutation.isPending
  };
};
