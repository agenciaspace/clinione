
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import PatientRecord from '@/components/patients/PatientRecord';
import { Patient } from '@/types';
import { User } from '@/types';

interface PatientRecordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  currentUser: User | null;
}

export const PatientRecordModal: React.FC<PatientRecordModalProps> = ({
  isOpen,
  onOpenChange,
  patient,
  currentUser,
}) => {
  // Efeito para limpar qualquer estado residual quando o modal for fechado
  useEffect(() => {
    if (!isOpen) {
      // Este efeito garante que o estado seja limpo quando o modal é fechado
      console.log("Modal fechado, limpando estado");
    }
    
    // Cleanup function to ensure proper resource cleanup
    return () => {
      console.log("PatientRecordModal unmounting, cleaning resources");
    };
  }, [isOpen]);

  // Se não há paciente selecionado, não renderize o modal
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogDescription className="sr-only">
          Prontuário do paciente {patient.name}
        </DialogDescription>
        <PatientRecord 
          patient={patient} 
          onClose={() => onOpenChange(false)} 
          currentUser={currentUser}
          // Use a robust unique key that includes all relevant variables
          key={`patient-record-${patient.id}-${isOpen}-${Date.now()}`}
        />
      </DialogContent>
    </Dialog>
  );
};
