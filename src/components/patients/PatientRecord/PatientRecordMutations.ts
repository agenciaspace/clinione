
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export function useCreateRecord(patientId: string, currentUser: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      // Get current session to ensure we have proper authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Check if this is a temporary patient (appointment-based)
      if (patientId.startsWith('temp-')) {
        // Extract appointment ID and update appointment notes
        const appointmentId = patientId.replace('temp-', '');
        
        const { data, error } = await supabase
          .from('appointments')
          .update({ 
            notes: content,
            updated_at: new Date().toISOString()
          })
          .eq('id', appointmentId)
          .select();

        if (error) {
          console.error('Detailed error:', error);
          throw error;
        }
        return data[0];
      } else {
        // Regular patient record
        const newRecord = {
          patient_id: patientId,
          content,
          created_by: currentUser?.id || session.user.id,
          created_by_name: currentUser?.name || currentUser?.email?.split('@')[0] || 'Sistema'
        };

        const { data, error } = await supabase
          .from('patient_records')
          .insert([newRecord])
          .select();

        if (error) {
          console.error('Detailed error:', error);
          throw error;
        }
        return data[0];
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientRecords', patientId] });
      // Also invalidate appointments if it's a temp patient
      if (patientId.startsWith('temp-')) {
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
      }
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
      // Check if this is an appointment-based record
      if (activeEntry?.type === 'appointment' && activeEntry?.appointment_data?.id) {
        // Update appointment notes
        const { data, error } = await supabase
          .from('appointments')
          .update({ 
            notes: content,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeEntry.appointment_data.id)
          .select();

        if (error) throw error;
        return data[0];
      } else {
        // Regular patient record update
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
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientRecords', patientId] });
      if (activeEntry?.id) {
        queryClient.invalidateQueries({ queryKey: ['patientRecordAudit', activeEntry?.id] });
      }
      // Also invalidate appointments if it's an appointment-based record
      if (activeEntry?.type === 'appointment') {
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
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
