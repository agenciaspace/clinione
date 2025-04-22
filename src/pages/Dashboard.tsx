
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Appointment, Doctor } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentDetails } from '@/components/appointments/AppointmentDetails';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { useAppointments } from '@/hooks/useAppointments';

const Dashboard = () => {
  const { user } = useAuth();
  const { activeClinic } = useClinic();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'all'>('day');
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { 
    appointments, 
    monthAppointments,
    allAppointments,
    isLoading, 
    createAppointment,
    confirmAppointment, 
    cancelAppointment, 
    deleteAppointment,
    updateAppointmentNotes 
  } = useAppointments(selectedDate, selectedDoctor);

  useEffect(() => {
    if (activeClinic) {
      fetchDoctors();
    } else {
      setDoctors([]);
    }
  }, [activeClinic]);
  
  const fetchDoctors = async () => {
    if (!activeClinic) return;
    
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('clinic_id', activeClinic.id);
        
      if (error) {
        console.error('Error fetching doctors:', error);
        return;
      }
      
      if (data) {
        setDoctors(data as Doctor[]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const handleOpenDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };
  
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedAppointment(null);
  };
  
  const handleUpdateNotes = (id: string, notes: string) => {
    updateAppointmentNotes(id, notes);
  };
  
  const handleOpenForm = () => {
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };
  
  const handleCreateAppointment = async (formData: any) => {
    let doctorName;
    if (formData.doctor_id) {
      const selectedDoctor = doctors.find(d => d.id === formData.doctor_id);
      doctorName = selectedDoctor?.name;
    }
    
    await createAppointment({
      ...formData,
      doctor_name: doctorName
    });
    
    setIsFormOpen(false);
  };

  const handleDeleteAppointment = (id: string) => {
    // Aqui adicionamos um try/catch para evitar travamentos
    try {
      deleteAppointment(id);
      toast.success('Agendamento excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast.error('Erro ao excluir agendamento');
    }
  };

  const hasAppointmentsOnDate = (date: Date) => {
    return monthAppointments.some(appointment => {
      const appointmentDate = new Date(appointment.date);
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const renderAppointmentCard = (appointment: Appointment) => {
    return (
      <div 
        key={appointment.id} 
        className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
        onClick={() => handleOpenDetails(appointment)}
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
                confirmAppointment(appointment.id);
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
              cancelAppointment(appointment.id);
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
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-500">
          {activeClinic 
            ? `Gerencie os agendamentos e consultas da clínica ${activeClinic.name}`
            : 'Selecione uma clínica para gerenciar agendamentos'
          }
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Selecione uma data para ver os agendamentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className="border rounded-md"
                modifiers={{
                  hasAppointment: (date) => hasAppointmentsOnDate(date),
                }}
                modifiersStyles={{
                  hasAppointment: {
                    backgroundColor: '#FFFAE6',
                    fontWeight: 'bold'
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Filtrar por profissional</p>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Visualização</p>
              <div className="flex space-x-2">
                <Button 
                  variant={view === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setView('all')}
                >
                  Todos
                </Button>
                <Button 
                  variant={view === 'day' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setView('day')}
                >
                  Dia
                </Button>
                <Button 
                  variant={view === 'week' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setView('week')}
                >
                  Semana
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
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
            <Button onClick={handleOpenForm}>Novo agendamento</Button>
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
                      <Button onClick={handleOpenForm}>Agendar consulta</Button>
                    </div>
                  </div>
                ) : (
                  (view === 'all' ? allAppointments : sortedAppointments).map(renderAppointmentCard)
                )}
              </TabsContent>
              
              <TabsContent value="scheduled" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (view === 'all' ? allAppointments : sortedAppointments)
                  .filter(a => a.status === 'scheduled')
                  .map(renderAppointmentCard)}
              </TabsContent>
              
              <TabsContent value="confirmed" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (view === 'all' ? allAppointments : sortedAppointments)
                  .filter(a => a.status === 'confirmed')
                  .map(renderAppointmentCard)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AppointmentDetails
        appointment={selectedAppointment}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onConfirm={confirmAppointment}
        onCancel={cancelAppointment}
        onDelete={handleDeleteAppointment}
        onUpdateNotes={handleUpdateNotes}
      />

      <AppointmentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateAppointment}
        doctors={doctors}
        selectedDate={selectedDate}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
