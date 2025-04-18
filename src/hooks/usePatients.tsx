
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Patient } from '@/types';

export const usePatients = (clinicId?: string) => {
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId);
      
      if (error) {
        console.error('Erro ao buscar pacientes:', error);
        toast.error("Erro ao carregar pacientes");
        return [];
      }
      
      return data.map((patient: any) => ({
        id: patient.id,
        name: patient.name,
        email: patient.email || '',
        phone: patient.phone || '',
        birthDate: patient.birth_date,
        created_at: patient.created_at,
        updated_at: patient.updated_at,
        clinic_id: patient.clinic_id,
        status: patient.status || 'active',
        lastVisit: patient.last_visit
      }));
    },
    enabled: !!clinicId,
    refetchOnWindowFocus: false,
    staleTime: 1000, // Considera os dados obsoletos após 1 segundo
  });

  const addPatientMutation = useMutation({
    mutationFn: async (newPatient: { name: string, email: string, phone: string, birth_date: string, clinic_id: string }) => {
      const { data, error } = await supabase
        .from('patients')
        .insert([newPatient])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', clinicId] });
      toast.success("Paciente adicionado com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao adicionar paciente:", error);
      toast.error("Erro ao adicionar paciente");
    }
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (updatePatient: Patient) => {
      const supabaseFormat = {
        name: updatePatient.name,
        email: updatePatient.email,
        phone: updatePatient.phone,
        birth_date: updatePatient.birthDate,
      };
      
      const { data, error } = await supabase
        .from('patients')
        .update(supabaseFormat)
        .eq('id', updatePatient.id)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', clinicId] });
      toast.success("Paciente atualizado com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao atualizar paciente:", error);
      toast.error("Erro ao atualizar paciente");
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
      toast.success("Paciente removido com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao remover paciente:", error);
      toast.error("Erro ao remover paciente");
    }
  });

  const togglePatientStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const { error } = await supabase
        .from('patients')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', clinicId] });
      toast.success("Status do paciente atualizado com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao alterar status do paciente:", error);
      toast.error("Erro ao alterar status do paciente");
    }
  });

  return {
    patients,
    isLoading,
    addPatientMutation,
    updatePatientMutation,
    deletePatientMutation,
    togglePatientStatusMutation
  };
};
