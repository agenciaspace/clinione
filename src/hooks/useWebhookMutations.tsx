import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useWebhookMutations = () => {
  const queryClient = useQueryClient();

  // Update webhook settings mutation
  const updateWebhookSettings = useMutation({
    mutationFn: async ({ 
      clinicId, 
      webhookUrl, 
      webhookSecret 
    }: { 
      clinicId: string; 
      webhookUrl: string; 
      webhookSecret: string;
    }) => {
      const { data, error } = await supabase
        .from('clinics')
        .update({
          webhook_url: webhookUrl.trim() || null,
          webhook_secret: webhookSecret.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', clinicId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Configurações de webhook salvas com sucesso');
      // Update the specific clinic in cache
      queryClient.setQueryData(['clinics'], (oldData: any[] | undefined) => {
        if (!oldData) return [data];
        return oldData.map(clinic => clinic.id === data.id ? data : clinic);
      });
    },
    onError: (error) => {
      console.error('Error saving webhook settings:', error);
      toast.error('Erro ao salvar configurações de webhook');
    }
  });

  return {
    updateWebhookSettings
  };
};