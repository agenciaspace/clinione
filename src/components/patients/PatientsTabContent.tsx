
import React from 'react';
import { Patient } from '@/types';
import { PatientList } from './PatientList';

interface PatientsTabContentProps {
  patients: Patient[];
  isLoading: boolean;
  onToggleStatus: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onOpenRecord: (patient: Patient) => void;
  onUpdatePatient?: (patient: Patient) => void;
}

export const PatientsTabContent = ({
  patients,
  isLoading,
  onToggleStatus,
  onDelete,
  onOpenRecord,
  onUpdatePatient,
}: PatientsTabContentProps) => {
  return (
    <PatientList
      patients={patients}
      isLoading={isLoading}
      onToggleStatus={onToggleStatus}
      onDelete={onDelete}
      onOpenRecord={onOpenRecord}
      onUpdatePatient={onUpdatePatient}
    />
  );
};
