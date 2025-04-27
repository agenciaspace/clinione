
import { useState } from 'react';
import { Patient, PatientFormData } from '@/types';
import { usePatients } from '@/hooks/usePatients';
import { usePatientMutations } from '@/hooks/mutations/usePatientMutations';
import { useClinic } from '@/contexts/ClinicContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

export const usePatientManagement = () => {
  const queryClient = useQueryClient();
  const { activeClinic } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [patientForm, setPatientForm] = useState<PatientFormData>({
    name: '',
    email: '',
    phone: '',
    birthDate: new Date().toISOString().split('T')[0]
  });

  const { patients, isLoading } = usePatients(activeClinic?.id);
  const { updatePatient, deletePatient, isUpdating, isDeleting } = usePatientMutations(activeClinic?.id);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeClinic) {
      toast.error("Selecione uma clínica para adicionar um paciente");
      return;
    }
  };

  const handleToggleStatus = (patient: Patient) => {
    const newStatus = patient.status === 'active' ? 'inactive' : 'active';
    updatePatient({ ...patient, status: newStatus });
  };

  const handleDeletePatient = async (id: string) => {
    try {
      console.log("Iniciando exclusão do paciente:", id);
      // Fechar o modal e limpar o estado se o paciente excluído for o paciente selecionado
      if (selectedPatient?.id === id) {
        setIsRecordModalOpen(false);
        // Aguarde um pouco antes de limpar o paciente selecionado para evitar problemas de renderização
        setTimeout(() => {
          setSelectedPatient(null);
        }, 300);
      }
      deletePatient(id);
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
      toast.error("Erro ao excluir paciente");
    }
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    console.log("Atualizando paciente:", updatedPatient);
    
    // Invalidar a query para forçar uma nova consulta após atualização
    queryClient.invalidateQueries({ queryKey: ['patients', activeClinic?.id] });
    
    // Atualizar o paciente selecionado se estiver aberto no modal
    if (selectedPatient?.id === updatedPatient.id) {
      // Evitar problemas de renderização ao atualizar o estado
      setTimeout(() => {
        setSelectedPatient(prevPatient => {
          if (prevPatient?.id === updatedPatient.id) {
            return updatedPatient;
          }
          return prevPatient;
        });
      }, 100);
    }
    
    toast.success('Paciente atualizado com sucesso');
  };

  // Garantir que o estado do modal seja corretamente atualizado
  const handleOpenRecordModal = (patient: Patient) => {
    // Primeiro defina o paciente selecionado
    setSelectedPatient(patient);
    // Em seguida, abra o modal com um pequeno atraso
    setTimeout(() => {
      setIsRecordModalOpen(true);
    }, 50);
  };

  const handleCloseRecordModal = () => {
    // Primeiro feche o modal
    setIsRecordModalOpen(false);
    // Atrase a limpeza do paciente selecionado para evitar problemas de renderização
    setTimeout(() => {
      setSelectedPatient(null);
    }, 300);
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  return {
    searchTerm,
    setSearchTerm,
    isAddPatientOpen,
    setIsAddPatientOpen,
    selectedPatient,
    setSelectedPatient,
    isRecordModalOpen,
    setIsRecordModalOpen,
    patientForm,
    handleInputChange,
    handleAddPatient,
    handleToggleStatus,
    handleDeletePatient,
    handleUpdatePatient,
    handleOpenRecordModal,
    handleCloseRecordModal,
    filteredPatients,
    isLoading,
  };
};
