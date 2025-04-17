
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
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
  });

  // Inicializa o formulário com os dados do paciente sempre que o paciente ou o estado do diálogo mudar
  useEffect(() => {
    if (isEditDialogOpen && patient) {
      setEditForm({
        name: patient.name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        birthDate: patient.birthDate || '',
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

  const handleSaveEdit = () => {
    if (!onUpdatePatient) return;
    
    const updatedPatient = {
      ...patient,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      birthDate: editForm.birthDate,
    };
    
    onUpdatePatient(updatedPatient);
    handleCloseEditDialog();
    toast.success("Paciente atualizado com sucesso");
  };

  const handleOpenEditDialog = () => {
    // Não precisamos inicializar o formulário aqui, pois o useEffect já faz isso
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    // Limpa o formulário ao fechar para garantir que na próxima abertura ele será reinicializado
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
          if (open) {
            // Se estiver abrindo, atualize o estado
            setIsEditDialogOpen(true);
          } else {
            // Se estiver fechando, use a função de fechamento que limpa o formulário
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
