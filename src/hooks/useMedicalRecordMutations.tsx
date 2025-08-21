import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useMedicalRecordMutations = (clinicId: string | undefined) => {
  const queryClient = useQueryClient();

  // Publish draft mutation
  const publishDraft = useMutation({
    mutationFn: async (appointmentId: string) => {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Prontuário publicado com sucesso!');
      // Invalidate medical records to refetch
      queryClient.invalidateQueries({ queryKey: ['medical-records', clinicId] });
    },
    onError: (error) => {
      console.error('Error publishing draft:', error);
      toast.error('Erro ao publicar rascunho');
    }
  });

  // Create medical record mutation
  const createMedicalRecord = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('patient_records')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Prontuário criado com sucesso!');
      // Invalidate medical records to refetch
      queryClient.invalidateQueries({ queryKey: ['medical-records', clinicId] });
    },
    onError: (error) => {
      console.error('Error creating medical record:', error);
      toast.error('Erro ao criar prontuário');
    }
  });

  // Update medical record mutation
  const updateMedicalRecord = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('patient_records')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Prontuário atualizado com sucesso!');
      // Invalidate medical records to refetch
      queryClient.invalidateQueries({ queryKey: ['medical-records', clinicId] });
    },
    onError: (error) => {
      console.error('Error updating medical record:', error);
      toast.error('Erro ao atualizar prontuário');
    }
  });

  // Delete medical record mutation
  const deleteMedicalRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patient_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Prontuário excluído com sucesso!');
      // Invalidate medical records to refetch
      queryClient.invalidateQueries({ queryKey: ['medical-records', clinicId] });
    },
    onError: (error) => {
      console.error('Error deleting medical record:', error);
      toast.error('Erro ao excluir prontuário');
    }
  });

  return {
    publishDraft,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
  };
};