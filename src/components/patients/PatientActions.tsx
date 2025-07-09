
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
  onScheduleAppointment: (patient: Patient) => void;
}

export const PatientActions = ({
  patient,
  onToggleStatus,
  onDelete,
  onOpenRecord,
  onUpdatePatient,
  onScheduleAppointment,
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
      const formattedDate = patient.birthDate 
        ? patient.birthDate.split('T')[0] 
        : '';
      
      setEditForm({
        name: patient.name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        birthDate: formattedDate,
      });
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

    const updatedPatient: Patient = {
      ...patient,
      name: editForm.name.trim(),
      email: editForm.email?.trim() || '',
      phone: editForm.phone?.trim() || '',
      birthDate: editForm.birthDate || patient.birthDate,
      status: patient.status as 'active' | 'inactive', // Explicitly type the status
    };
    
    try {
      // Use the updatePatient mutation which now returns a promise
      const updatedData = await updatePatient(updatedPatient);
      
      // Close the dialog first
      setIsEditDialogOpen(false);
      
      // Notify about the update with the server-returned data
      if (onUpdatePatient && updatedData) {
        console.log("Notificando sobre atualização do paciente:", updatedData);
        onUpdatePatient(updatedData);
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
    setEditForm({
      name: '',
      email: '',
      phone: '',
      birthDate: '',
    });
  };

  return (
    <>
      <PatientActionMenu
        patient={patient}
        onEdit={handleOpenEditDialog}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onOpenRecord={onOpenRecord}
        onScheduleAppointment={onScheduleAppointment}
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
