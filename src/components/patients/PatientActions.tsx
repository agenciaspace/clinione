
import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Edit, UserX, UserCheck, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Patient } from '@/types';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';

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

  // Atualiza o formulário quando o paciente ou o estado do diálogo muda
  useEffect(() => {
    if (isEditDialogOpen && patient) {
      setEditForm({
        name: patient.name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        birthDate: patient.birthDate || '',
      });
    }
  }, [isEditDialogOpen, patient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = () => {
    // Atualiza os dados do paciente
    const updatedPatient = {
      ...patient,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      birthDate: editForm.birthDate,
    };
    
    if (onUpdatePatient) {
      onUpdatePatient(updatedPatient);
    }
    
    setIsEditDialogOpen(false);
    toast.success("Paciente atualizado com sucesso");
  };

  const handleOpenEditDialog = () => {
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Agendar consulta</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => onOpenRecord(patient)}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Prontuário</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={handleOpenEditDialog}
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => onToggleStatus(patient)}
          >
            {patient.status === 'active' ? (
              <>
                <UserX className="mr-2 h-4 w-4 text-orange-500" />
                <span className="text-orange-500">Desativar</span>
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4 text-healthgreen-600" />
                <span className="text-healthgreen-600">Ativar</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer text-red-600"
            onClick={() => onDelete(patient.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Excluir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
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
                value={editForm.name}
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
                value={editForm.email}
                onChange={handleInputChange}
                type="email" 
                placeholder="email@exemplo.com" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                name="phone"
                value={editForm.phone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birthDate">Data de nascimento</Label>
              <Input 
                id="birthDate" 
                name="birthDate"
                value={editForm.birthDate ? format(new Date(editForm.birthDate), 'yyyy-MM-dd') : ''}
                onChange={handleInputChange}
                type="date" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
