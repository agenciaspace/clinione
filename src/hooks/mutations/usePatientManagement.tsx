
import { useState, useCallback } from 'react';
import { Patient, PatientFormData } from '@/types';
import { usePatients } from '@/hooks/usePatients';
import { usePatientMutations } from '@/hooks/mutations/usePatientMutations';
import { useClinic } from '@/contexts/ClinicContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';

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

  const handleToggleStatus = useCallback((patient: Patient) => {
    const newStatus = patient.status === 'active' ? 'inactive' : 'active';
    updatePatient({ ...patient, status: newStatus });
  }, [updatePatient]);

  const handleDeletePatient = useCallback(async (id: string) => {
    try {
      console.log("Iniciando exclusão do paciente:", id);
      
      // Fechar o modal se o paciente excluído for o paciente selecionado
      if (selectedPatient?.id === id) {
        setIsRecordModalOpen(false);
        setSelectedPatient(null);
      }
      
      await deletePatient(id);
      
      // Forçar a atualização da lista
      if (activeClinic?.id) {
        queryClient.invalidateQueries({ queryKey: ['patients', activeClinic.id] });
      }
      
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
      toast.error("Erro ao excluir paciente");
    }
  }, [selectedPatient, deletePatient, activeClinic?.id, queryClient]);

  const handleUpdatePatient = useCallback((updatedPatient: Patient) => {
    console.log("Atualizando paciente:", updatedPatient);
    
    // Invalidar a query para forçar uma nova consulta após atualização
    if (activeClinic?.id) {
      queryClient.invalidateQueries({ queryKey: ['patients', activeClinic.id] });
    }
    
    // Atualizar o paciente selecionado se estiver aberto no modal
    if (selectedPatient?.id === updatedPatient.id) {
      setSelectedPatient(updatedPatient);
    }
    
    toast.success('Paciente atualizado com sucesso');
  }, [selectedPatient, queryClient, activeClinic?.id]);

  // Garantir que o estado do modal seja corretamente atualizado
  const handleOpenRecordModal = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setIsRecordModalOpen(true);
  }, []);

  const handleCloseRecordModal = useCallback(() => {
    setIsRecordModalOpen(false);
    setSelectedPatient(null);
  }, []);

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.phone && patient.phone.includes(searchTerm))
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
