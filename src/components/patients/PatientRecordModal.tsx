
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <PatientRecord 
          patient={patient} 
          onClose={() => onOpenChange(false)} 
          currentUser={currentUser}
        />
      </DialogContent>
    </Dialog>
  );
};
