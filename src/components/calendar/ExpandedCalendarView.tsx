import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Appointment, ScheduleBlock, Doctor } from '@/types';

interface ExpandedCalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointments: Appointment[];
  scheduleBlocks: ScheduleBlock[];
  doctors: Doctor[];
  onNewAppointment: (date: Date) => void;
  onNewBlock: (date: Date) => void;
}

export const ExpandedCalendarView: React.FC<ExpandedCalendarViewProps> = ({
  selectedDate,
  onDateSelect,
  appointments,
  scheduleBlocks,
  doctors,
  onNewAppointment,
  onNewBlock
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const isMobile = useIsMobile();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.name || 'Médico';
  };

  const getDayAppointments = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return isSameDay(aptDate, date);
    });
  };

  const getDayBlocks = (date: Date) => {
    return scheduleBlocks.filter(block => {
      const blockStart = new Date(block.start_datetime);
      const blockEnd = new Date(block.end_datetime);
      return (
        isSameDay(blockStart, date) ||
        isSameDay(blockEnd, date) ||
        (blockStart <= date && blockEnd >= date)
      );
    });
  };

  const getBlockTypeColor = (type: string) => {
    const colors = {
      unavailable: 'bg-gray-100 text-gray-700 border-gray-300',
      break: 'bg-blue-100 text-blue-700 border-blue-300',
      meeting: 'bg-purple-100 text-purple-700 border-purple-300',
      vacation: 'bg-green-100 text-green-700 border-green-300',
      sick_leave: 'bg-red-100 text-red-700 border-red-300',
      personal: 'bg-orange-100 text-orange-700 border-orange-300',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getAppointmentStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-300',
      confirmed: 'bg-green-100 text-green-700 border-green-300',
      completed: 'bg-gray-100 text-gray-700 border-gray-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300',
      'no-show': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    };
    return colors[status as keyof typeof colors] || 'bg-blue-100 text-blue-700 border-blue-300';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Hoje
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Calendar Grid */}
        <div className="border-t">
          {/* Week Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="p-3 text-center text-sm font-medium text-gray-700 border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 divide-x divide-gray-200">
            {calendarDays.map((date, index) => {
              const dayAppointments = getDayAppointments(date);
              const dayBlocks = getDayBlocks(date);
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={`
                    ${isMobile ? 'min-h-[80px]' : 'min-h-[120px]'} border-b cursor-pointer hover:bg-gray-50 transition-colors
                    ${!isCurrentMonth ? 'bg-gray-50/50' : ''}
                    ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
                    ${isTodayDate ? 'bg-yellow-50' : ''}
                  `}
                  onClick={() => onDateSelect(date)}
                >
                  <div className="p-2 h-full flex flex-col">
                    {/* Date Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          text-sm font-medium
                          ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                          ${isTodayDate ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs' : ''}
                        `}
                      >
                        {format(date, 'd')}
                      </span>
                      
                      {/* Quick Actions */}
                      {isCurrentMonth && (
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 hover:bg-blue-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNewAppointment(date);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Events Container */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {/* Schedule Blocks */}
                      {dayBlocks.slice(0, 2).map((block) => (
                        <div
                          key={block.id}
                          className={`
                            text-xs px-2 py-1 rounded border truncate
                            ${getBlockTypeColor(block.block_type)}
                          `}
                          title={`${block.title} - ${getDoctorName(block.doctor_id)}`}
                        >
                          🚫 {block.title}
                        </div>
                      ))}

                      {/* Appointments */}
                      {dayAppointments.slice(0, isMobile ? 2 : 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`
                            text-xs px-2 py-1 rounded border truncate
                            ${getAppointmentStatusColor(appointment.status)}
                          `}
                          title={`${appointment.patient_name} - ${appointment.doctor_name || getDoctorName(appointment.doctor_id || '')}`}
                        >
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(appointment.date), 'HH:mm')}
                          </div>
                          <div className="truncate">{appointment.patient_name}</div>
                        </div>
                      ))}

                      {/* More indicator */}
                      {(dayAppointments.length + dayBlocks.length) > (isMobile ? 2 : 3) && (
                        <div className="text-xs text-gray-500 px-2">
                          +{(dayAppointments.length + dayBlocks.length) - (isMobile ? 2 : 3)} mais
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};