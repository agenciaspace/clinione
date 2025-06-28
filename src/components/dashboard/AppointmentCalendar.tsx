import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Doctor } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarIcon, Filter, Eye } from 'lucide-react';

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
  const isMobile = useIsMobile();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg sm:text-xl">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Calendário
        </CardTitle>
        <CardDescription className="text-sm">
          {isMobile ? 'Selecione uma data' : 'Selecione uma data para ver os agendamentos'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-3 sm:p-6">
        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ptBR}
            className={`border rounded-md ${isMobile ? 'scale-90' : ''}`}
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
        
        {/* Doctor Filter */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            <p className="text-sm font-medium">
              {isMobile ? 'Profissional' : 'Filtrar por profissional'}
            </p>
          </div>
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os profissionais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              {doctors.map(doctor => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* View Options */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            <p className="text-sm font-medium">Visualização</p>
          </div>
          <div className={`${
            isMobile 
              ? 'grid grid-cols-3 gap-2' 
              : 'flex space-x-2'
          }`}>
            <Button 
              variant={view === 'all' ? 'default' : 'outline'} 
              size={isMobile ? "sm" : "sm"}
              onClick={() => setView('all')}
              className={isMobile ? 'text-xs' : ''}
            >
              Todos
            </Button>
            <Button 
              variant={view === 'day' ? 'default' : 'outline'} 
              size={isMobile ? "sm" : "sm"}
              onClick={() => setView('day')}
              className={isMobile ? 'text-xs' : ''}
            >
              Dia
            </Button>
            <Button 
              variant={view === 'week' ? 'default' : 'outline'} 
              size={isMobile ? "sm" : "sm"}
              onClick={() => setView('week')}
              className={isMobile ? 'text-xs' : ''}
            >
              Semana
            </Button>
          </div>
        </div>

        {/* Mobile: Current Date Display */}
        {isMobile && selectedDate && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-900">
              Data selecionada:
            </p>
            <p className="text-lg font-semibold text-primary">
              {format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
