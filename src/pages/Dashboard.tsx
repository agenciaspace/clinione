
import React, { useState } from 'react';
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

// Dados mockados para exemplo
const mockAppointments = [
  {
    id: '1',
    patientName: 'Maria Silva',
    doctorName: 'Dr. João Cardoso',
    date: new Date(2025, 3, 15, 10, 30),
    status: 'scheduled',
    type: 'in-person'
  },
  {
    id: '2',
    patientName: 'Pedro Santos',
    doctorName: 'Dra. Ana Beatriz',
    date: new Date(2025, 3, 15, 14, 0),
    status: 'confirmed',
    type: 'online'
  },
  {
    id: '3',
    patientName: 'Júlia Ferreira',
    doctorName: 'Dr. João Cardoso',
    date: new Date(2025, 3, 15, 16, 15),
    status: 'confirmed',
    type: 'in-person'
  },
  {
    id: '4',
    patientName: 'Carlos Oliveira',
    doctorName: 'Dra. Ana Beatriz',
    date: new Date(2025, 3, 16, 9, 0),
    status: 'scheduled',
    type: 'in-person'
  },
  {
    id: '5',
    patientName: 'Fernanda Costa',
    doctorName: 'Dr. João Cardoso',
    date: new Date(2025, 3, 16, 11, 30),
    status: 'scheduled',
    type: 'online'
  }
];

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 3, 15));
  const [view, setView] = useState<'day' | 'week'>('day');
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  
  // Filtrar consultas pelo dia selecionado e médico (se selecionado)
  const filteredAppointments = mockAppointments.filter(appointment => {
    const sameDate = selectedDate && 
      appointment.date.getDate() === selectedDate.getDate() &&
      appointment.date.getMonth() === selectedDate.getMonth() &&
      appointment.date.getFullYear() === selectedDate.getFullYear();
      
    if (selectedDoctor) {
      return sameDate && appointment.doctorName.includes(selectedDoctor);
    }
    
    return sameDate;
  });
  
  // Ordenar por horário
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );

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
                  <SelectItem value="Dr. João Cardoso">Dr. João Cardoso</SelectItem>
                  <SelectItem value="Dra. Ana Beatriz">Dra. Ana Beatriz</SelectItem>
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
                {sortedAppointments.length === 0 
                  ? 'Nenhum agendamento para este dia' 
                  : `${sortedAppointments.length} agendamento(s)`}
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
                {sortedAppointments.length === 0 ? (
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
                            <span className="font-medium">{appointment.patientName}</span>
                          </p>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{appointment.doctorName}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {appointment.type === 'online' ? 'Teleconsulta' : 'Presencial'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-shrink-0 space-x-2">
                        {appointment.status !== 'confirmed' && (
                          <Button size="sm" variant="outline" className="text-healthgreen-600 border-healthgreen-200 hover:border-healthgreen-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="text-gray-500 hover:text-gray-700">
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="scheduled" className="space-y-4">
                {sortedAppointments
                  .filter(a => a.status === 'scheduled')
                  .map((appointment) => (
                    // Conteúdo igual ao anterior, apenas filtrado
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
                            <span className="font-medium">{appointment.patientName}</span>
                          </p>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{appointment.doctorName}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {appointment.type === 'online' ? 'Teleconsulta' : 'Presencial'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-shrink-0 space-x-2">
                        <Button size="sm" variant="outline" className="text-healthgreen-600 border-healthgreen-200 hover:border-healthgreen-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button size="sm" variant="outline" className="text-gray-500 hover:text-gray-700">
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ))}
              </TabsContent>
              
              <TabsContent value="confirmed" className="space-y-4">
                {sortedAppointments
                  .filter(a => a.status === 'confirmed')
                  .map((appointment) => (
                    // Conteúdo igual ao anterior, apenas filtrado
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
                            <span className="font-medium">{appointment.patientName}</span>
                          </p>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{appointment.doctorName}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {appointment.type === 'online' ? 'Teleconsulta' : 'Presencial'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-shrink-0">
                        <Button size="sm" variant="outline" className="text-gray-500 hover:text-gray-700">
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
