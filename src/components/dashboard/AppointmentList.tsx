import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, User, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  const renderAppointmentCard = (appointment: Appointment) => {
    return (
      <div 
        key={appointment.id} 
        className="flex flex-col sm:flex-row sm:items-start p-3 sm:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => onOpenDetails(appointment)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between mb-2 sm:mb-1">
            <p className="text-sm sm:text-base font-medium text-gray-900">
              {format(new Date(appointment.date), 'HH:mm')}
            </p>
            <Badge 
              variant={appointment.status === 'confirmed' ? 'default' : 'outline'}
              className={`text-xs ${appointment.status === 'confirmed' ? 'bg-healthgreen-600' : ''}`}
            >
              {appointment.status === 'confirmed' ? 'Confirmado' : 'Agendado'}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-gray-600 flex items-center">
              <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="font-medium truncate">{appointment.patient_name}</span>
            </p>
            <p className="text-sm text-gray-500 flex items-center">
              <Clock className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{appointment.doctor_name || 'Sem médico atribuído'}</span>
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {appointment.type === 'online' ? 'Teleconsulta' : 'Presencial'}
              </p>
              {appointment.notes && (
                <p className="text-xs text-gray-500 italic hidden sm:block">
                  Obs: {appointment.notes.length > 30 ? `${appointment.notes.substring(0, 30)}...` : appointment.notes}
                </p>
              )}
            </div>
            {appointment.notes && isMobile && (
              <p className="text-xs text-gray-500 italic">
                Obs: {appointment.notes.length > 25 ? `${appointment.notes.substring(0, 25)}...` : appointment.notes}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-3 sm:mt-0 sm:ml-4 sm:flex-shrink-0">
          {appointment.status !== 'confirmed' && (
            <Button 
              size={isMobile ? "sm" : "sm"}
              variant="outline" 
              className="text-healthgreen-600 border-healthgreen-200 hover:border-healthgreen-600 flex-1 sm:flex-none"
              onClick={(e) => {
                e.stopPropagation();
                onConfirm(appointment.id);
              }}
            >
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {isMobile ? 'OK' : 'Confirmar'}
            </Button>
          )}
          <Button 
            size={isMobile ? "sm" : "sm"}
            variant="outline" 
            className="text-gray-500 hover:text-gray-700 flex-1 sm:flex-none"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(appointment.id);
            }}
          >
            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            {isMobile ? 'X' : 'Cancelar'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="lg:col-span-8">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg sm:text-xl">
            {view === 'all' ? 
              'Todos os agendamentos' : 
              (selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR }))}
          </CardTitle>
          <CardDescription className="text-sm">
            {isLoading ? 'Carregando agendamentos...' : 
              (view === 'all' ? 
                `${allAppointments.length} agendamento(s) no total` :
                (appointments.length === 0 
                  ? 'Nenhum agendamento para este dia' 
                  : `${appointments.length} agendamento(s)`)
              )}
          </CardDescription>
        </div>
        <Button 
          onClick={onOpenForm}
          size={isMobile ? "sm" : "default"}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isMobile ? 'Novo' : 'Novo agendamento'}
        </Button>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all" className="text-xs sm:text-sm">Todos</TabsTrigger>
            <TabsTrigger value="scheduled" className="text-xs sm:text-sm">Agendados</TabsTrigger>
            <TabsTrigger value="confirmed" className="text-xs sm:text-sm">Confirmados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (view === 'all' ? allAppointments : appointments).length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Sem agendamentos</h3>
                <p className="mt-1 text-sm text-gray-500 px-4">
                  Não há consultas agendadas {view === 'all' ? '' : 'para esta data'}.
                </p>
                <div className="mt-6">
                  <Button onClick={onOpenForm} size={isMobile ? "sm" : "default"}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar consulta
                  </Button>
                </div>
              </div>
            ) : (
              (view === 'all' ? allAppointments : appointments).map(renderAppointmentCard)
            )}
          </TabsContent>
          
          <TabsContent value="scheduled" className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (view === 'all' ? allAppointments : appointments)
              .filter(a => a.status === 'scheduled')
              .map(renderAppointmentCard)}
          </TabsContent>
          
          <TabsContent value="confirmed" className="space-y-3">
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
