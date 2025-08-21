
import { useState, useCallback } from 'react';
import { Patient, PatientFormData } from '@/types';
import { usePatients } from '@/hooks/usePatients';
import { usePatientMutations } from '@/hooks/mutations/usePatientMutations';
import { useClinic } from '@/contexts/ClinicContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { useModalPersistence } from '@/hooks/useModalPersistence';
import { useFormPersistence } from '@/hooks/useFormPersistence';

export const usePatientManagement = () => {
  const queryClient = useQueryClient();
  const { activeClinic } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');

  // Usar persistência para o modal de adicionar paciente
  const addPatientModal = useModalPersistence({
    key: `add-patient-${activeClinic?.id || 'no-clinic'}`,
    maxAge: 30 * 60 * 1000, // 30 minutos
  });

  // Usar persistência para o modal de prontuário
  const recordModal = useModalPersistence<Patient>({
    key: `patient-record-${activeClinic?.id || 'no-clinic'}`,
    maxAge: 60 * 60 * 1000, // 1 hora
    onRestore: (patient) => {
      console.log('Restaurando modal de prontuário para:', patient.name);
    }
  });

  // Usar persistência para o formulário de paciente
  const patientFormPersistence = useFormPersistence<PatientFormData>({
    key: `patient-form-${activeClinic?.id || 'no-clinic'}`,
    initialValues: {
      name: '',
      email: '',
      phone: '',
      birthDate: new Date().toISOString().split('T')[0],
      cpf: ''
    },
    maxAge: 60 * 60 * 1000, // 1 hora
    onRestore: (data) => {
      console.log('Restaurando dados do formulário de paciente:', data);
    },
    onAutoSave: (data) => {
      console.log('Auto-salvando formulário de paciente:', data);
    }
  });

  const { patients, isLoading } = usePatients(activeClinic?.id);
  const { createPatient, updatePatient, deletePatient, isCreating, isUpdating, isDeleting } = usePatientMutations(activeClinic?.id);

  const handleInputChange = patientFormPersistence.handleInputChange;

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeClinic) {
      toast.error("Selecione uma clínica para adicionar um paciente");
      return;
    }

    try {
      await createPatient(patientFormPersistence.formData);
      
      // Reset form and close modal
      patientFormPersistence.resetForm();
      addPatientModal.closeModal();
      
    } catch (error) {
      console.error('Erro ao adicionar paciente:', error);
      // Error already handled by the mutation
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
      if (recordModal.data?.id === id) {
        recordModal.closeModal();
      }
      
      await deletePatient(id);
      
      // Reduzir invalidateQueries para evitar recarregamentos excessivos
      // Usar setQueryData para atualização otimista
      queryClient.setQueryData(['patients', activeClinic?.id], (oldData: Patient[] = []) => {
        return oldData.filter(patient => patient.id !== id);
      });
      
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
      toast.error("Erro ao excluir paciente");
      
      // Em caso de erro, invalidar para garantir consistência
      if (activeClinic?.id) {
        queryClient.invalidateQueries({ queryKey: ['patients', activeClinic.id] });
      }
    }
  }, [recordModal, deletePatient, activeClinic?.id, queryClient]);

  const handleUpdatePatient = useCallback((updatedPatient: Patient) => {
    console.log("Atualizando paciente:", updatedPatient);
    
    // Update the patients data in the cache directly
    queryClient.setQueryData(['patients', activeClinic?.id], (oldData: Patient[] = []) => {
      return oldData.map(patient => 
        patient.id === updatedPatient.id ? updatedPatient : patient
      );
    });
    
    // Atualizar o paciente selecionado se estiver aberto no modal
    if (recordModal.data?.id === updatedPatient.id) {
      recordModal.updateData(updatedPatient);
    }
  }, [recordModal, queryClient, activeClinic?.id]);

  // Garantir que o estado do modal seja corretamente atualizado
  const handleOpenRecordModal = useCallback((patient: Patient) => {
    recordModal.openModal(patient);
  }, [recordModal]);

  const handleCloseRecordModal = useCallback(() => {
    recordModal.closeModal();
  }, [recordModal]);

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  return {
    searchTerm,
    setSearchTerm,
    isAddPatientOpen: addPatientModal.isOpen,
    setIsAddPatientOpen: addPatientModal.setIsOpen,
    selectedPatient: recordModal.data,
    setSelectedPatient: recordModal.updateData,
    isRecordModalOpen: recordModal.isOpen,
    setIsRecordModalOpen: recordModal.setIsOpen,
    patientForm: patientFormPersistence.formData,
    handleInputChange,
    handleAddPatient,
    handleToggleStatus,
    handleDeletePatient,
    handleUpdatePatient,
    handleOpenRecordModal,
    handleCloseRecordModal,
    filteredPatients,
    isLoading,
    isCreating,
  };
};
