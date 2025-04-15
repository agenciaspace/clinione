
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  date: Date;
  status: 'scheduled' | 'confirmed' | 'cancelled';
  type: 'in-person' | 'online';
}

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('id, name');
          
        if (error) {
          console.error('Error fetching doctors:', error);
          return;
        }
        
        if (data) {
          setDoctors(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchDoctors();
  }, []);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedDate) return;
      
      setLoading(true);
      try {
        // Format the date to match the database format
        const dateStart = new Date(selectedDate);
        dateStart.setHours(0, 0, 0, 0);
        
        const dateEnd = new Date(selectedDate);
        dateEnd.setHours(23, 59, 59, 999);
        
        let query = supabase
          .from('appointments')
          .select('*')
          .gte('date', dateStart.toISOString())
          .lte('date', dateEnd.toISOString());
          
        if (selectedDoctor) {
          query = query.eq('doctor_id', selectedDoctor);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching appointments:', error);
          return;
        }
        
        if (data) {
          // Transform the data to match our Appointment interface
          const formattedAppointments: Appointment[] = data.map((appt: any) => ({
            id: appt.id,
            patient_name: appt.patient_name || 'Patient',
            doctor_name: appt.doctor_name || 'Doctor',
            date: new Date(appt.date),
            status: appt.status || 'scheduled',
            type: appt.type || 'in-person'
          }));
          
          setAppointments(formattedAppointments);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [selectedDate, selectedDoctor]);
  
  // Filtrar consultas pelo dia selecionado e médico (se selecionado)
  const filteredAppointments = appointments.filter(appointment => {
    const sameDate = selectedDate && 
      appointment.date.getDate() === selectedDate.getDate() &&
      appointment.date.getMonth() === selectedDate.getMonth() &&
      appointment.date.getFullYear() === selectedDate.getFullYear();
      
    if (selectedDoctor) {
      return sameDate && appointment.doctor_name.includes(selectedDoctor);
    }
    
    return sameDate;
  });
  
  // Ordenar por horário
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );

  const handleConfirmAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', id);
        
      if (error) {
        toast.error('Erro ao confirmar agendamento');
        console.error('Error confirming appointment:', error);
        return;
      }
      
      // Update the local state
      setAppointments(appointments.map(appt => 
        appt.id === id ? { ...appt, status: 'confirmed' } : appt
      ));
      
      toast.success('Agendamento confirmado com sucesso');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocorreu um erro ao confirmar o agendamento');
    }
  };
  
  const handleCancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);
        
      if (error) {
        toast.error('Erro ao cancelar agendamento');
        console.error('Error canceling appointment:', error);
        return;
      }
      
      // Update the local state
      setAppointments(appointments.map(appt => 
        appt.id === id ? { ...appt, status: 'cancelled' } : appt
      ));
      
      toast.success('Agendamento cancelado com sucesso');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocorreu um erro ao cancelar o agendamento');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-500">Gerencie seus agendamentos e consultas</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendário e filtros */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Selecione uma data para ver os agendamentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className="border rounded-md"
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
        
        {/* Consultas do dia */}
        <Card className="lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </CardTitle>
              <CardDescription>
                {loading ? 'Carregando agendamentos...' : 
                  (sortedAppointments.length === 0 
                  ? 'Nenhum agendamento para este dia' 
                  : `${sortedAppointments.length} agendamento(s)`)}
              </CardDescription>
            </div>
            <Button>Novo agendamento</Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="scheduled">Agendados</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmados</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : sortedAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Sem agendamentos</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Não há consultas agendadas para esta data.
                    </p>
                    <div className="mt-6">
                      <Button>Agendar consulta</Button>
                    </div>
                  </div>
                ) : (
                  sortedAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-start p-4 border rounded-lg hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {format(appointment.date, 'HH:mm')}
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
                            <span>{appointment.doctor_name}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {appointment.type === 'online' ? 'Teleconsulta' : 'Presencial'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-shrink-0 space-x-2">
                        {appointment.status !== 'confirmed' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-healthgreen-600 border-healthgreen-200 hover:border-healthgreen-600"
                            onClick={() => handleConfirmAppointment(appointment.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="scheduled" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : sortedAppointments
                  .filter(a => a.status === 'scheduled')
                  .map((appointment) => (
                    <div key={appointment.id} className="flex items-start p-4 border rounded-lg hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {format(appointment.date, 'HH:mm')}
                          </p>
                          <Badge variant="outline">Agendado</Badge>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <User className="mr-1 h-4 w-4" />
                            <span className="font-medium">{appointment.patient_name}</span>
                          </p>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{appointment.doctor_name}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {appointment.type === 'online' ? 'Teleconsulta' : 'Presencial'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-shrink-0 space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-healthgreen-600 border-healthgreen-200 hover:border-healthgreen-600"
                          onClick={() => handleConfirmAppointment(appointment.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ))}
              </TabsContent>
              
              <TabsContent value="confirmed" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : sortedAppointments
                  .filter(a => a.status === 'confirmed')
                  .map((appointment) => (
                    <div key={appointment.id} className="flex items-start p-4 border rounded-lg hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {format(appointment.date, 'HH:mm')}
                          </p>
                          <Badge className="bg-healthgreen-600">Confirmado</Badge>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <User className="mr-1 h-4 w-4" />
                            <span className="font-medium">{appointment.patient_name}</span>
                          </p>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{appointment.doctor_name}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {appointment.type === 'online' ? 'Teleconsulta' : 'Presencial'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-shrink-0">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
