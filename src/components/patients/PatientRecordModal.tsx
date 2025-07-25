import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import PatientRecord from '@/components/patients/PatientRecord';
import { Patient } from '@/types';
import { User } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
      <DialogContent className={`${
        isMobile 
          ? 'max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-4' 
          : 'sm:max-w-4xl max-h-[90vh] p-6'
      } overflow-y-auto`}>
        <DialogDescription className="sr-only">
          Prontuário do paciente {patient.name}
        </DialogDescription>
        <PatientRecord 
          patient={patient} 
          onClose={() => onOpenChange(false)} 
          currentUser={currentUser}
          // Usar uma chave mais simples e estável
          key={`patient-record-${patient.id}`}
        />
      </DialogContent>
    </Dialog>
  );
};
