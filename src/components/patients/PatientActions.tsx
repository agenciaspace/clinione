
import React, { useState, useEffect } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
  });

  // Inicializa o formulário quando o diálogo é aberto
  useEffect(() => {
    if (isEditDialogOpen && patient) {
      setEditForm({
        name: patient.name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        birthDate: patient.birthDate ? patient.birthDate.split('T')[0] : '',
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
    if (!onUpdatePatient) {
      toast.error("Função de atualização não disponível");
      return;
    }
    
    if (!editForm.name.trim()) {
      toast.error("O nome do paciente é obrigatório");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updatedPatient = {
        ...patient,
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        birthDate: editForm.birthDate,
      };
      
      await onUpdatePatient(updatedPatient);
      toast.success("Paciente atualizado com sucesso");
      handleCloseEditDialog();
    } catch (error) {
      console.error("Erro ao atualizar paciente:", error);
      toast.error("Erro ao atualizar paciente. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditDialog = () => {
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    
    // Limpamos o formulário após um pequeno delay para garantir uma transição suave
    setTimeout(() => {
      setEditForm({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
      });
      setIsSubmitting(false);
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
          if (open) {
            setIsEditDialogOpen(true);
          } else {
            handleCloseEditDialog();
          }
        }}
        formData={editForm}
        onInputChange={handleInputChange}
        onSave={handleSaveEdit}
        isLoading={isSubmitting}
      />
    </>
  );
};
