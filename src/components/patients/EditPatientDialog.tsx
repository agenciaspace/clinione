
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { maskCPF, validateCPF } from '@/utils/cpf-validation';

interface EditPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    cpf: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export const EditPatientDialog = ({
  open,
  onOpenChange,
  formData,
  onInputChange,
  onSave,
  isLoading = false,
}: EditPatientDialogProps) => {
  const [cpfError, setCpfError] = useState<string | null>(null);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const maskedValue = maskCPF(value);
    
    // Update the form with masked CPF
    onInputChange({
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
    const cpfValidationError = validateCPF(formData.cpf);
    if (cpfValidationError) {
      setCpfError(cpfValidationError);
      return;
    }
    
    setCpfError(null);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar paciente</DialogTitle>
            <DialogDescription>
              Atualize as informações do paciente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome completo <span className="text-red-500">*</span></Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={onInputChange}
                placeholder="Nome do paciente" 
                required
                disabled={isLoading}
                className="w-full"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                value={formData.email}
                onChange={onInputChange}
                type="email" 
                placeholder="email@exemplo.com"
                disabled={isLoading}
                className="w-full"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                name="phone"
                value={formData.phone}
                onChange={onInputChange}
                placeholder="(00) 00000-0000"
                disabled={isLoading}
                className="w-full"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input 
                id="cpf" 
                name="cpf"
                value={formData.cpf || ''}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                required
                disabled={isLoading}
                className={`w-full ${cpfError ? 'border-red-500' : ''}`}
                autoComplete="off"
              />
              {cpfError && <span className="text-sm text-red-500">{cpfError}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birthDate">Data de nascimento</Label>
              <Input 
                id="birthDate" 
                name="birthDate"
                value={formData.birthDate}
                onChange={onInputChange}
                type="date"
                disabled={isLoading}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
