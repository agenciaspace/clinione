
import React, { useState } from 'react';
import { Patient } from '@/types';
import { toast } from '@/components/ui/sonner';
import { EditPatientDialog } from './EditPatientDialog';
import { PatientActionMenu } from './PatientActionMenu';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = () => {
    const updatedPatient = {
      ...patient,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      birthDate: editForm.birthDate,
    };
    
    if (onUpdatePatient) {
      onUpdatePatient(updatedPatient);
    }
    
    handleCloseEditDialog();
    toast.success("Paciente atualizado com sucesso");
  };

  const handleOpenEditDialog = () => {
    setEditForm({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      birthDate: patient.birthDate || '',
    });
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
      />

      <EditPatientDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseEditDialog();
          }
        }}
        formData={editForm}
        onInputChange={handleInputChange}
        onSave={handleSaveEdit}
      />
    </>
  );
};
