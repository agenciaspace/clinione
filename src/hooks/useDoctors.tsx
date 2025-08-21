
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';
import { toast } from '@/components/ui/sonner';
import { Doctor, WorkingHours } from '@/types';

export const useDoctors = () => {
  const { activeClinic } = useClinic();
  const queryClient = useQueryClient();

  const fetchDoctors = async (): Promise<Doctor[]> => {
    if (!activeClinic?.id) return [];

    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('clinic_id', activeClinic.id)
      .order('name');

    if (error) throw error;
    
    // Convert the data to match our Doctor type
    return (data || []).map(doctor => ({
      ...doctor,
      working_hours: doctor.working_hours ? doctor.working_hours as WorkingHours : undefined
    })) as Doctor[];
  };

  const {
    data: doctors = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['doctors', activeClinic?.id],
    queryFn: fetchDoctors,
    enabled: !!activeClinic?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Verificar se um médico possui agendamentos
  const checkDoctorAppointments = async (doctorId: string) => {
    const { data, error, count } = await supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .eq('doctor_id', doctorId)
      .limit(1);
      
    if (error) throw error;
    return (count && count > 0);
  };

  // Excluir médico
  const deleteDoctor = useMutation({
    mutationFn: async (id: string) => {
      // Verificar se existem agendamentos primeiro
      const hasAppointments = await checkDoctorAppointments(id);
      
      if (hasAppointments) {
        throw new Error("Este profissional possui agendamentos associados e não pode ser excluído. Cancele os agendamentos primeiro ou inative o profissional.");
      }
      
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      toast.success('Profissional removido com sucesso');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
    onError: (error: any) => {
      console.error('Error deleting doctor:', error);
      toast.error(error.message || 'Não foi possível excluir o profissional');
    }
  });

  // Inativar médico em vez de excluir (alternativa mais segura)
  const inactivateDoctor = useMutation({
    mutationFn: async (id: string) => {
      // Aqui não estamos realmente implementando a inativação ainda,
      // mas poderia ser adicionado um campo status na tabela doctors
      // e este método atualizaria esse campo para 'inactive'
      
      // Por enquanto, apenas simulamos com um erro
      throw new Error("Função de inativação não implementada. Isso seria uma alternativa à exclusão para preservar o histórico.");
    }
  });

  return {
    doctors,
    isLoading,
    error,
    refetch,
    deleteDoctor: deleteDoctor.mutate,
    inactivateDoctor: inactivateDoctor.mutate
  };
};
