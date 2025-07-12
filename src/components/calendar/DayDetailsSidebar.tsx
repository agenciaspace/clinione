import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User, Plus, Edit, Trash2, Shield, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Appointment, ScheduleBlock, Doctor } from '@/types';

interface DayDetailsSidebarProps {
  selectedDate: Date;
  appointments: Appointment[];
  scheduleBlocks: ScheduleBlock[];
  doctors: Doctor[];
  onNewAppointment: () => void;
  onNewBlock: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onEditBlock: (block: ScheduleBlock) => void;
  onDeleteBlock: (id: string) => void;
}

export const DayDetailsSidebar: React.FC<DayDetailsSidebarProps> = ({
  selectedDate,
  appointments,
  scheduleBlocks,
  doctors,
  onNewAppointment,
  onNewBlock,
  onEditAppointment,
  onDeleteAppointment,
  onEditBlock,
  onDeleteBlock
}) => {
  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.name || 'Médico';
  };

  const getBlockTypeLabel = (type: string) => {
    const labels = {
      unavailable: 'Indisponível',
      break: 'Intervalo',
      meeting: 'Reunião',
      vacation: 'Férias',
      sick_leave: 'Licença Médica',
      personal: 'Pessoal',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getBlockTypeColor = (type: string) => {
    const colors = {
      unavailable: 'bg-gray-500',
      break: 'bg-blue-500',
      meeting: 'bg-purple-500',
      vacation: 'bg-green-500',
      sick_leave: 'bg-red-500',
      personal: 'bg-orange-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getAppointmentStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-500',
      confirmed: 'bg-green-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500',
      'no-show': 'bg-yellow-500',
    };
    return colors[status as keyof typeof colors] || 'bg-blue-500';
  };

  const getAppointmentStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      'no-show': 'Faltou',
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Sort appointments by time
  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Sort blocks by time
  const sortedBlocks = [...scheduleBlocks].sort((a, b) => 
    new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
  );

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="space-y-3">
          <CardTitle className="text-lg truncate">
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </CardTitle>
          <div className="flex flex-col space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onNewAppointment}
              className="w-full justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onNewBlock}
              className="w-full justify-start"
            >
              <Shield className="h-4 w-4 mr-2" />
              Novo Bloqueio
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {/* Schedule Blocks Section */}
        {sortedBlocks.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Bloqueios
            </h3>
            <div className="space-y-2">
              {sortedBlocks.map((block) => (
                <div
                  key={block.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2 min-w-0 flex-1">
                        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${getBlockTypeColor(block.block_type)}`} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{block.title}</p>
                          <p className="text-xs text-gray-600 truncate">
                            {getDoctorName(block.doctor_id)}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {format(new Date(block.start_datetime), 'HH:mm')} - 
                              {format(new Date(block.end_datetime), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                          {getBlockTypeLabel(block.block_type)}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onEditBlock(block)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => onDeleteBlock(block.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {block.description && (
                      <p className="text-xs text-gray-500 pl-5 break-words">
                        {block.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Separator */}
        {sortedBlocks.length > 0 && sortedAppointments.length > 0 && (
          <Separator />
        )}

        {/* Appointments Section */}
        {sortedAppointments.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Agendamentos ({sortedAppointments.length})
            </h3>
            <div className="space-y-2">
              {sortedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2 min-w-0 flex-1">
                        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${getAppointmentStatusColor(appointment.status)}`} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{appointment.patient_name}</p>
                          <p className="text-xs text-gray-600 truncate">
                            {appointment.doctor_name || getDoctorName(appointment.doctor_id || '')}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span>{format(new Date(appointment.date), 'HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                        <Badge 
                          variant="secondary" 
                          className="text-xs whitespace-nowrap"
                        >
                          {getAppointmentStatusLabel(appointment.status)}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onEditAppointment(appointment)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => onDeleteAppointment(appointment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {appointment.notes && (
                      <p className="text-xs text-gray-500 pl-5 break-words">
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {sortedAppointments.length === 0 && sortedBlocks.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Nenhum evento neste dia</p>
            </div>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onNewAppointment}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onNewBlock}
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Novo Bloqueio
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};