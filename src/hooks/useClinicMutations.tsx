import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Clinic } from '@/types';

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  slug: string;
}

export const useClinicMutations = () => {
  const queryClient = useQueryClient();

  // Create clinic mutation
  const createClinic = useMutation({
    mutationFn: async ({ formData, userId }: { formData: ClinicFormData; userId: string }) => {
      const { data, error } = await supabase
        .from('clinics')
        .insert({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          slug: formData.slug || null,
          owner_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data as Clinic;
    },
    onSuccess: (data) => {
      toast.success('Clínica criada com sucesso');
      // Invalidate and refetch clinics
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
    onError: (error) => {
      console.error('Erro ao criar clínica:', error);
      toast.error('Ocorreu um erro ao criar a clínica');
    }
  });

  // Update clinic mutation
  const updateClinic = useMutation({
    mutationFn: async ({ clinicId, formData }: { clinicId: string; formData: ClinicFormData }) => {
      const { data, error } = await supabase
        .from('clinics')
        .update({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          slug: formData.slug || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', clinicId)
        .select()
        .single();

      if (error) throw error;
      return data as Clinic;
    },
    onSuccess: (data) => {
      toast.success('Clínica atualizada com sucesso');
      // Update the specific clinic in cache
      queryClient.setQueryData(['clinics'], (oldData: Clinic[] | undefined) => {
        if (!oldData) return [data];
        return oldData.map(clinic => clinic.id === data.id ? data : clinic);
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar clínica:', error);
      toast.error('Ocorreu um erro ao atualizar a clínica');
    }
  });

  // Delete clinic mutation
  const deleteClinic = useMutation({
    mutationFn: async (clinicId: string) => {
      // Delete all related data first (in correct order)
      const tables = [
        'notification_logs',
        'notification_queue',
        'email_templates',
        'notification_preferences',
        'smtp_config',
        'drafts',
        'schedule_blocks',
        'archived_medical_data',
        'patient_records',
        'patients',
        'doctors',
        'appointments',
        'webhook_events',
        'webhook_endpoints',
        'dead_webhook_events',
        'transactions',
        'user_roles'
      ];

      // Delete from each table
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('clinic_id', clinicId);
        
        if (error) {
          console.error(`Erro ao excluir dados de ${table}:`, error);
        }
      }

      // Finally delete the clinic
      const { error: clinicError } = await supabase
        .from('clinics')
        .delete()
        .eq('id', clinicId);
        
      if (clinicError) throw clinicError;
      
      return clinicId;
    },
    onSuccess: (clinicId) => {
      toast.success('Clínica excluída com sucesso');
      // Remove from cache
      queryClient.setQueryData(['clinics'], (oldData: Clinic[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(clinic => clinic.id !== clinicId);
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir clínica:', error);
      toast.error('Ocorreu um erro ao excluir a clínica');
    }
  });

  // Toggle publish status
  const togglePublish = useMutation({
    mutationFn: async ({ clinicId, isPublished }: { clinicId: string; isPublished: boolean }) => {
      const { data, error } = await supabase
        .from('clinics')
        .update({ 
          is_published: !isPublished,
          last_published_at: !isPublished ? new Date().toISOString() : null
        })
        .eq('id', clinicId)
        .select()
        .single();

      if (error) throw error;
      return data as Clinic;
    },
    onSuccess: (data) => {
      toast.success(
        data.is_published ? "Página publicada" : "Página despublicada", 
        {
          description: data.is_published 
            ? "Sua página agora está publicamente disponível." 
            : "Sua página não está mais publicamente disponível."
        }
      );
      // Update the specific clinic in cache
      queryClient.setQueryData(['clinics'], (oldData: Clinic[] | undefined) => {
        if (!oldData) return [data];
        return oldData.map(clinic => clinic.id === data.id ? data : clinic);
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar status de publicação:', error);
      toast.error("Erro ao publicar", {
        description: "Não foi possível atualizar o status de publicação."
      });
    }
  });

  return {
    createClinic,
    updateClinic,
    deleteClinic,
    togglePublish
  };
};