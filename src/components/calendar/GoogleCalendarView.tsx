import React, { useState, useMemo } from 'react';
import { isSameDay } from 'date-fns';
import { ExpandedCalendarView } from './ExpandedCalendarView';
import { DayDetailsSidebar } from './DayDetailsSidebar';
import { ScheduleBlockDialog } from './ScheduleBlockDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Appointment, ScheduleBlock, Doctor } from '@/types';

interface GoogleCalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointments: Appointment[];
  scheduleBlocks: ScheduleBlock[];
  doctors: Doctor[];
  clinicId: string;
  selectedDoctorId?: string;
  onNewAppointment: (date?: Date) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onDeleteBlock: (id: string) => void;
}

export const GoogleCalendarView: React.FC<GoogleCalendarViewProps> = ({
  selectedDate,
  onDateSelect,
  appointments,
  scheduleBlocks,
  doctors,
  clinicId,
  selectedDoctorId,
  onNewAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onDeleteBlock
}) => {
  const isMobile = useIsMobile();
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [blockDialogDate, setBlockDialogDate] = useState<Date | undefined>(undefined);
  // Filter appointments and blocks for the selected date
  const selectedDayAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return isSameDay(aptDate, selectedDate);
    });
  }, [appointments, selectedDate]);

  const selectedDayBlocks = useMemo(() => {
    return scheduleBlocks.filter(block => {
      const blockStart = new Date(block.start_datetime);
      const blockEnd = new Date(block.end_datetime);
      return (
        isSameDay(blockStart, selectedDate) ||
        isSameDay(blockEnd, selectedDate) ||
        (blockStart <= selectedDate && blockEnd >= selectedDate)
      );
    });
  }, [scheduleBlocks, selectedDate]);

  const handleNewAppointment = (date?: Date) => {
    if (date) {
      onDateSelect(date);
    }
    onNewAppointment(date);
  };

  const handleNewBlock = (date?: Date) => {
    setEditingBlock(null);
    setBlockDialogDate(date);
    if (date) {
      onDateSelect(date);
    }
    setIsBlockDialogOpen(true);
  };

  const handleEditBlock = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setBlockDialogDate(new Date(block.start_datetime));
    setIsBlockDialogOpen(true);
  };

  const handleCloseBlockDialog = () => {
    setIsBlockDialogOpen(false);
    setEditingBlock(null);
    setBlockDialogDate(undefined);
  };

  return (
    <div className={`${isMobile ? 'space-y-4' : 'flex h-full gap-6'}`}>
      {/* Main Calendar View */}
      <div className="flex-1 min-w-0">
        <ExpandedCalendarView
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          appointments={appointments}
          scheduleBlocks={scheduleBlocks}
          doctors={doctors}
          onNewAppointment={handleNewAppointment}
          onNewBlock={handleNewBlock}
        />
      </div>

      {/* Sidebar with day details */}
      <div className={`${isMobile ? 'w-full' : 'w-80 flex-shrink-0'}`}>
        <DayDetailsSidebar
          selectedDate={selectedDate}
          appointments={selectedDayAppointments}
          scheduleBlocks={selectedDayBlocks}
          doctors={doctors}
          onNewAppointment={() => onNewAppointment()}
          onNewBlock={() => handleNewBlock()}
          onEditAppointment={onEditAppointment}
          onDeleteAppointment={onDeleteAppointment}
          onEditBlock={handleEditBlock}
          onDeleteBlock={onDeleteBlock}
        />
      </div>

      {/* Schedule Block Dialog */}
      <ScheduleBlockDialog
        isOpen={isBlockDialogOpen}
        onClose={handleCloseBlockDialog}
        clinicId={clinicId}
        doctors={doctors}
        selectedDate={blockDialogDate}
        selectedDoctorId={selectedDoctorId}
        initialBlock={editingBlock || undefined}
        isEditing={!!editingBlock}
      />
    </div>
  );
};