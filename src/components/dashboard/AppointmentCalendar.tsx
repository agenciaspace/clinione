
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Doctor } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AppointmentCalendarProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedDoctor: string | undefined;
  setSelectedDoctor: (id: string | undefined) => void;
  doctors: Doctor[];
  view: 'day' | 'week' | 'all';
  setView: (view: 'day' | 'week' | 'all') => void;
  hasAppointmentsOnDate: (date: Date) => boolean;
}

export function AppointmentCalendar({
  selectedDate,
  setSelectedDate,
  selectedDoctor,
  setSelectedDoctor,
  doctors,
  view,
  setView,
  hasAppointmentsOnDate
}: AppointmentCalendarProps) {
  return (
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
  );
}
