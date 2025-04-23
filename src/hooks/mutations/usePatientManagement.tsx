
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
      if (selectedPatient?.id === id) {
        setIsRecordModalOpen(false);
        setSelectedPatient(null);
      }
      deletePatient(id);
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
      toast.error("Erro ao excluir paciente");
    }
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    queryClient.invalidateQueries({ queryKey: ['patients', activeClinic?.id] });
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
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
    filteredPatients,
    isLoading,
  };
};
