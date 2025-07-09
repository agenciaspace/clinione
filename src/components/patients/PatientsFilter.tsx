
import React from 'react';
import { Patient } from '@/types';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchAndAddBar } from './SearchAndAddBar';
import { PatientFormData } from '@/types';

interface PatientsFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isAddPatientOpen: boolean;
  setIsAddPatientOpen: (open: boolean) => void;
  patientForm: PatientFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddPatient: (e: React.FormEvent) => void;
  isCreating?: boolean;
}

export const PatientsFilter: React.FC<PatientsFilterProps> = ({
  searchTerm,
  onSearchChange,
  isAddPatientOpen,
  setIsAddPatientOpen,
  patientForm,
  handleInputChange,
  handleAddPatient,
  isCreating = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
      <TabsList>
        <TabsTrigger value="all">Todos</TabsTrigger>
        <TabsTrigger value="active">Ativos</TabsTrigger>
        <TabsTrigger value="inactive">Inativos</TabsTrigger>
      </TabsList>
      
      <SearchAndAddBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        isAddPatientOpen={isAddPatientOpen}
        setIsAddPatientOpen={setIsAddPatientOpen}
        patientForm={patientForm}
        handleInputChange={handleInputChange}
        handleAddPatient={handleAddPatient}
        isCreating={isCreating}
      />
    </div>
  );
};
