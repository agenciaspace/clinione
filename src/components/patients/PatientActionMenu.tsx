
import React from 'react';
import { Calendar, FileText, Edit, UserX, UserCheck, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Patient } from '@/types';

interface PatientActionMenuProps {
  patient: Patient;
  onEdit: () => void;
  onToggleStatus: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onOpenRecord: (patient: Patient) => void;
  onScheduleAppointment: (patient: Patient) => void;
}

export const PatientActionMenu = ({
  patient,
  onEdit,
  onToggleStatus,
  onDelete,
  onOpenRecord,
  onScheduleAppointment,
}: PatientActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => onScheduleAppointment(patient)}
        >
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
          onClick={onEdit}
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
  );
};
