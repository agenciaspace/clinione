
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export function useCreateRecord(patientId: string, currentUser: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const newRecord = {
        patient_id: patientId,
        content,
        created_by: currentUser?.id || 'sistema',
        created_by_name: currentUser?.email?.split('@')[0] || 'Sistema'
      };

      const { data, error } = await supabase
        .from('patient_records')
        .insert([newRecord])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientRecords', patientId] });
      toast.success('Prontuário atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao criar entrada:', error);
      toast.error('Falha ao atualizar prontuário');
    }
  });
}

export function useUpdateRecord(patientId: string, activeEntry: any, currentUser: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data: currentRecord } = await supabase
        .from('patient_records')
        .select('content')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('patient_records')
        .update({ 
          content, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      await supabase
        .from('patient_record_audit')
        .insert([{
          record_id: id,
          action: 'update',
          content_before: currentRecord?.content,
          content_after: content,
          user_id: currentUser?.id || 'sistema',
          user_name: currentUser?.email?.split('@')[0] || 'Sistema'
        }]);

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientRecords', patientId] });
      if (activeEntry?.id) {
        queryClient.invalidateQueries({ queryKey: ['patientRecordAudit', activeEntry?.id] });
      }
      toast.success('Prontuário atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao atualizar entrada:', error);
      toast.error('Falha ao atualizar prontuário');
    }
  });
}

export function useDeleteRecord(patientId: string, activeEntry: any, currentUser: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: currentRecord } = await supabase
        .from('patient_records')
        .select('content')
        .eq('id', id)
        .single();

      await supabase
        .from('patient_record_audit')
        .insert([{
          record_id: id,
          action: 'delete',
          content_before: currentRecord?.content,
          user_id: currentUser?.id || 'sistema',
          user_name: currentUser?.email?.split('@')[0] || 'Sistema'
        }]);

      const { error } = await supabase
        .from('patient_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientRecords', patientId] });
      toast.success('Entrada removida com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao deletar entrada:', error);
      toast.error('Falha ao remover entrada do prontuário');
    }
  });
}
