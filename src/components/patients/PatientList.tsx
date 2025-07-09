import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Patient } from '@/types';
import { PatientActions } from './PatientActions';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { User, Mail, Phone, Calendar, MoreHorizontal } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  isLoading: boolean;
  onToggleStatus: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onOpenRecord: (patient: Patient) => void;
  onUpdatePatient?: (patient: Patient) => void;
  onScheduleAppointment: (patient: Patient) => void;
}

export const PatientList = ({
  patients,
  isLoading,
  onToggleStatus,
  onDelete,
  onOpenRecord,
  onUpdatePatient,
  onScheduleAppointment,
}: PatientListProps) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {isMobile ? (
          // Mobile loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Desktop loading table
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum paciente encontrado</h3>
        <p className="mt-1 text-sm text-gray-500 px-4">
          Adicione seu primeiro paciente usando o botão acima.
        </p>
      </div>
    );
  }

  // Mobile card layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        {patients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{patient.name}</h3>
                    <Badge 
                      variant={patient.status === 'active' ? 'default' : 'outline'} 
                      className={`text-xs ${patient.status === 'active' ? 'bg-healthgreen-600' : ''}`}
                    >
                      {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {patient.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                    )}
                    
                    {patient.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{format(new Date(patient.birthDate), 'dd/MM/yyyy')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={patient.status === 'active'} 
                        onCheckedChange={() => onToggleStatus(patient)}
                        className={patient.status === 'active' ? 'bg-healthgreen-600' : ''}
                      />
                      <span className="text-xs text-gray-500">
                        {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <PatientActions 
                      patient={patient}
                      onToggleStatus={onToggleStatus}
                      onDelete={onDelete}
                      onOpenRecord={onOpenRecord}
                      onUpdatePatient={onUpdatePatient}
                      onScheduleAppointment={(patient) => {
                        console.log('PatientList (mobile): onScheduleAppointment called for:', patient.name);
                        onScheduleAppointment(patient);
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop table layout
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Nome</TableHead>
            <TableHead className="hidden md:table-cell min-w-[200px]">Email</TableHead>
            <TableHead className="min-w-[120px]">Telefone</TableHead>
            <TableHead className="hidden lg:table-cell min-w-[100px]">Nascimento</TableHead>
            <TableHead className="hidden lg:table-cell min-w-[100px]">Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="font-medium">{patient.name}</div>
                <div className="text-sm text-gray-500 md:hidden truncate max-w-[200px]">
                  {patient.email}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="truncate max-w-[200px]">{patient.email}</div>
              </TableCell>
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
                  <Badge 
                    variant={patient.status === 'active' ? 'default' : 'outline'} 
                    className={patient.status === 'active' ? 'bg-healthgreen-600' : ''}
                  >
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
                  onUpdatePatient={onUpdatePatient}
                  onScheduleAppointment={(patient) => {
                    console.log('PatientList (desktop): onScheduleAppointment called for:', patient.name);
                    onScheduleAppointment(patient);
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
