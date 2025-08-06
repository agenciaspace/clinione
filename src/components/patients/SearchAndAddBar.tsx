
import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PatientFormData } from '@/types';
import { maskCPF, validateCPF } from '@/utils/cpf-validation';
import { usePatients } from '@/hooks/usePatients';
import { useClinic } from '@/contexts/ClinicContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SearchAndAddBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isAddPatientOpen: boolean;
  setIsAddPatientOpen: (open: boolean) => void;
  patientForm: PatientFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddPatient: (e: React.FormEvent) => void;
  isCreating?: boolean;
}

export const SearchAndAddBar = ({
  searchTerm,
  onSearchChange,
  isAddPatientOpen,
  setIsAddPatientOpen,
  patientForm,
  handleInputChange,
  handleAddPatient,
  isCreating = false,
}: SearchAndAddBarProps) => {
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [cpfDuplicate, setCpfDuplicate] = useState<boolean>(false);
  const { activeClinic } = useClinic();
  const { patients } = usePatients(activeClinic?.id);

  // Check for duplicate CPF whenever CPF changes
  useEffect(() => {
    if (patientForm.cpf && patientForm.cpf.length >= 14) { // CPF with mask has 14 chars
      const cleanCpf = patientForm.cpf.replace(/\D/g, '');
      const isDuplicate = patients.some(patient => 
        patient.cpf?.replace(/\D/g, '') === cleanCpf
      );
      setCpfDuplicate(isDuplicate);
    } else {
      setCpfDuplicate(false);
    }
  }, [patientForm.cpf, patients]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const maskedValue = maskCPF(value);
    
    // Update the form with masked CPF
    handleInputChange({
      ...e,
      target: {
        ...e.target,
        name: 'cpf',
        value: maskedValue,
      }
    });
    
    // Validate CPF
    const error = validateCPF(maskedValue);
    setCpfError(error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate CPF before submission
    const cpfValidationError = validateCPF(patientForm.cpf);
    if (cpfValidationError) {
      setCpfError(cpfValidationError);
      return;
    }
    
    // Check for duplicate CPF
    if (cpfDuplicate) {
      setCpfError('Este CPF já está cadastrado nesta clínica');
      return;
    }
    
    // Clear CPF error if validation passed
    setCpfError(null);
    
    handleAddPatient(e);
  };
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar paciente..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar novo paciente</DialogTitle>
            <DialogDescription>
              Preencha os dados do paciente para cadastrá-lo no sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={patientForm.name}
                  onChange={handleInputChange}
                  placeholder="Nome do paciente" 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  value={patientForm.email}
                  onChange={handleInputChange}
                  type="email" 
                  placeholder="email@exemplo.com" 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={patientForm.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000" 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <Input 
                  id="birthDate" 
                  name="birthDate"
                  value={patientForm.birthDate}
                  onChange={handleInputChange}
                  type="date" 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input 
                  id="cpf" 
                  name="cpf"
                  value={patientForm.cpf || ''}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00" 
                  required 
                  className={cpfError || cpfDuplicate ? 'border-red-500' : ''}
                />
                {cpfError && <span className="text-sm text-red-500">{cpfError}</span>}
                {cpfDuplicate && !cpfError && (
                  <Alert className="mt-2 border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      Este CPF já está cadastrado nesta clínica. Se deseja atualizar os dados do paciente, 
                      feche este formulário e edite o paciente existente.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddPatientOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating || cpfDuplicate || !!cpfError}>
                {isCreating ? 'Cadastrando...' : 'Cadastrar Paciente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
