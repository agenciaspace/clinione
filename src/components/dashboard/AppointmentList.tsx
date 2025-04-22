import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, User, Clock, CheckCircle, XCircle } from 'lucide-react';

interface AppointmentListProps {
  appointments: Appointment[];
  allAppointments: Appointment[];
  isLoading: boolean;
  view: 'day' | 'week' | 'all';
  onOpenForm: () => void;
  onOpenDetails: (appointment: Appointment) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  selectedDate?: Date;
}

export function AppointmentList({
  appointments,
  allAppointments,
  isLoading,
  view,
  onOpenForm,
  onOpenDetails,
  onConfirm,
  onCancel,
  selectedDate
}: AppointmentListProps) {
  const renderAppointmentCard = (appointment: Appointment) => {
    return (
      <div 
        key={appointment.id} 
        className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
        onClick={() => onOpenDetails(appointment)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {format(new Date(appointment.date), 'HH:mm')}
            </p>
            <Badge 
              variant={appointment.status === 'confirmed' ? 'default' : 'outline'}
              className={appointment.status === 'confirmed' ? 'bg-healthgreen-600' : ''}
            >
              {appointment.status === 'confirmed' ? 'Confirmado' : 'Agendado'}
            </Badge>
          </div>
          <div className="mt-1">
            <p className="text-sm text-gray-500 flex items-center">
              <User className="mr-1 h-4 w-4" />
              <span className="font-medium">{appointment.patient_name}</span>
            </p>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <Clock className="mr-1 h-4 w-4" />
              <span>{appointment.doctor_name || 'Sem médico atribuído'}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {appointment.type === 'online' ? 'Teleconsulta' : 'Presencial'}
            </p>
            {appointment.notes && (
              <p className="text-xs text-gray-500 mt-1 italic">
                Obs: {appointment.notes.length > 30 ? `${appointment.notes.substring(0, 30)}...` : appointment.notes}
              </p>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex flex-shrink-0 space-x-2">
          {appointment.status !== 'confirmed' && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-healthgreen-600 border-healthgreen-200 hover:border-healthgreen-600"
              onClick={(e) => {
                e.stopPropagation();
                onConfirm(appointment.id);
              }}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Confirmar
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            className="text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(appointment.id);
            }}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="lg:col-span-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            {view === 'all' ? 
              'Todos os agendamentos' : 
              (selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR }))}
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando agendamentos...' : 
              (view === 'all' ? 
                `${allAppointments.length} agendamento(s) no total` :
                (appointments.length === 0 
                  ? 'Nenhum agendamento para este dia' 
                  : `${appointments.length} agendamento(s)`)
              )}
          </CardDescription>
        </div>
        <Button onClick={onOpenForm}>Novo agendamento</Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="scheduled">Agendados</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (view === 'all' ? allAppointments : appointments).length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Sem agendamentos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Não há consultas agendadas {view === 'all' ? '' : 'para esta data'}.
                </p>
                <div className="mt-6">
                  <Button onClick={onOpenForm}>Agendar consulta</Button>
                </div>
              </div>
            ) : (
              (view === 'all' ? allAppointments : appointments).map(renderAppointmentCard)
            )}
          </TabsContent>
          
          <TabsContent value="scheduled" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (view === 'all' ? allAppointments : appointments)
              .filter(a => a.status === 'scheduled')
              .map(renderAppointmentCard)}
          </TabsContent>
          
          <TabsContent value="confirmed" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (view === 'all' ? allAppointments : appointments)
              .filter(a => a.status === 'confirmed')
              .map(renderAppointmentCard)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
