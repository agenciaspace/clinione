
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
      try {
        console.log('Iniciando exclusão do paciente ID:', id);
        
        // Primeiro, buscar todos os prontuários do paciente para logging
        const { data: recordsData, error: recordsError } = await supabase
          .from('patient_records')
          .select('id')
          .eq('patient_id', id);
        
        if (recordsError) {
          console.error('Erro ao verificar prontuários:', recordsError);
        } else {
          console.log(`Encontrados ${recordsData?.length || 0} prontuários associados ao paciente.`);
        }
        
        // Agora excluir o paciente (com ON DELETE CASCADE configurado no banco)
        const { error } = await supabase
          .from('patients')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Erro ao excluir paciente:', error);
          throw error;
        }
        
        console.log('Paciente excluído com sucesso:', id);
        return id;
      } catch (error) {
        console.error('Erro durante a exclusão do paciente:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', clinicId] });
      toast.success('Paciente removido com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao remover paciente:', error);
      toast.error('Erro ao remover paciente. Verifique se não há registros vinculados.');
    }
  });

  return {
    updatePatient: updatePatientMutation.mutate,
    deletePatient: deletePatientMutation.mutate,
    isUpdating: updatePatientMutation.isPending,
    isDeleting: deletePatientMutation.isPending
  };
};
