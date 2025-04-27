
import React, { useState, useEffect } from 'react';
import { Patient } from '@/types';
import { toast } from '@/components/ui/sonner';
import { EditPatientDialog } from './EditPatientDialog';
import { PatientActionMenu } from './PatientActionMenu';
import { usePatientMutations } from '@/hooks/mutations/usePatientMutations';
import { useClinic } from '@/contexts/ClinicContext';

interface PatientActionsProps {
  patient: Patient;
  onToggleStatus: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onOpenRecord: (patient: Patient) => void;
  onUpdatePatient?: (patient: Patient) => void;
}

export const PatientActions = ({
  patient,
  onToggleStatus,
  onDelete,
  onOpenRecord,
  onUpdatePatient,
}: PatientActionsProps) => {
  const { activeClinic } = useClinic();
  const { updatePatient, isUpdating } = usePatientMutations(activeClinic?.id);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
  });

  // Atualizar o formulário quando o paciente ou o estado do diálogo mudar
  useEffect(() => {
    if (isEditDialogOpen && patient) {
      // Use setTimeout to ensure we have the latest patient data
      setTimeout(() => {
        const formattedDate = patient.birthDate 
          ? patient.birthDate.split('T')[0] 
          : '';
        
        setEditForm({
          name: patient.name || '',
          email: patient.email || '',
          phone: patient.phone || '',
          birthDate: formattedDate,
        });
      }, 50);
    }
  }, [patient, isEditDialogOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      toast.error("O nome do paciente é obrigatório");
      return;
    }

    const updatedPatient = {
      ...patient,
      name: editForm.name.trim(),
      email: editForm.email?.trim() || '',
      phone: editForm.phone?.trim() || '',
      birthDate: editForm.birthDate || patient.birthDate,
    };
    
    try {
      await updatePatient(updatedPatient);
      
      // Close the dialog first
      handleCloseEditDialog();
      
      // Notify about the update with a delay to ensure state is updated properly
      if (onUpdatePatient) {
        console.log("Notificando sobre atualização do paciente:", updatedPatient);
        setTimeout(() => {
          onUpdatePatient(updatedPatient);
        }, 300);
      }
    } catch (error) {
      console.error("Erro ao atualizar paciente:", error);
      toast.error("Erro ao atualizar paciente");
    }
  };

  const handleOpenEditDialog = () => {
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    // Clear form with delay to avoid React state update conflicts
    setTimeout(() => {
      setEditForm({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
      });
    }, 300);
  };

  return (
    <>
      <PatientActionMenu
        patient={patient}
        onEdit={handleOpenEditDialog}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onOpenRecord={onOpenRecord}
      />

      <EditPatientDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseEditDialog();
        }}
        formData={editForm}
        onInputChange={handleInputChange}
        onSave={handleSaveEdit}
        isLoading={isUpdating}
      />
    </>
  );
};
