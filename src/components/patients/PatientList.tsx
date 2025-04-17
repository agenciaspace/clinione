
import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Patient } from '@/types';
import { PatientActions } from './PatientActions';

interface PatientListProps {
  patients: Patient[];
  isLoading: boolean;
  onToggleStatus: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onOpenRecord: (patient: Patient) => void;
}

export const PatientList = ({
  patients,
  isLoading,
  onToggleStatus,
  onDelete,
  onOpenRecord,
}: PatientListProps) => {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="h-24 text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (patients.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="h-24 text-center py-6 text-gray-500">
          Nenhum paciente encontrado. Adicione seu primeiro paciente usando o botão acima.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead className="hidden md:table-cell">Email</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead className="hidden lg:table-cell">Nascimento</TableHead>
          <TableHead className="hidden lg:table-cell">Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>
              <div className="font-medium">{patient.name}</div>
              <div className="text-sm text-gray-500 md:hidden">{patient.email}</div>
            </TableCell>
            <TableCell className="hidden md:table-cell">{patient.email}</TableCell>
            <TableCell>{patient.phone}</TableCell>
            <TableCell className="hidden lg:table-cell">
              {format(new Date(patient.birthDate), 'dd/MM/yyyy')}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={patient.status === 'active'} 
                  onCheckedChange={() => onToggleStatus(patient)}
                  className={patient.status === 'active' ? 'bg-healthgreen-600' : ''}
                />
                <Badge variant={patient.status === 'active' ? 'default' : 'outline'} className={patient.status === 'active' ? 'bg-healthgreen-600' : ''}>
                  {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <PatientActions 
                patient={patient}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
                onOpenRecord={onOpenRecord}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
