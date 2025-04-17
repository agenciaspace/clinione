
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    name: string;
    email: string;
    phone: string;
    birthDate: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export const EditPatientDialog = ({
  open,
  onOpenChange,
  formData,
  onInputChange,
  onSave,
}: EditPatientDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar paciente</DialogTitle>
          <DialogDescription>
            Atualize as informações do paciente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={onInputChange}
              placeholder="Nome do paciente" 
              required 
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
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="birthDate">Data de nascimento</Label>
            <Input 
              id="birthDate" 
              name="birthDate"
              value={formData.birthDate ? formData.birthDate.split('T')[0] : ''}
              onChange={onInputChange}
              type="date" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave}>Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
