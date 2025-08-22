import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Doctor, Appointment, WorkingHours, ScheduleBlock } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentDetails } from '@/components/appointments/AppointmentDetails';
import { AppointmentFormSimple } from '@/components/appointments/AppointmentFormSimple';
import { useAppointments } from '@/hooks/useAppointments';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePatients } from '@/hooks/usePatients';
import { useScheduleBlocks } from '@/hooks/useScheduleBlocks';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleCalendarView } from '@/components/calendar/GoogleCalendarView';
import { toast } from '@/components/ui/sonner';

const Calendar = () => {
  const { user } = useAuth();
  const { activeClinic } = useClinic();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(!isMobile); // Fechado por padrão no mobile
  const [isScheduleBlocksOpen, setIsScheduleBlocksOpen] = useState(false);
  const [calendarView] = useState<'expanded'>('expanded');
  
  const { 
    allAppointments,
    createAppointment,
    confirmAppointment, 
    cancelAppointment, 
    deleteAppointment,
    updateAppointmentNotes 
  } = useAppointments(selectedDate, selectedDoctor);

  const { patients, isLoading: isPatientsLoading } = usePatients(activeClinic?.id);
  const { isTimeSlotBlocked, scheduleBlocks, deleteScheduleBlock } = useScheduleBlocks(activeClinic?.id, selectedDoctor);


  useEffect(() => {
    if (activeClinic) {
      fetchDoctors();
    } else {
      setDoctors([]);
    }
  }, [activeClinic]);

  // Re-fetch doctors when form opens to ensure fresh data
  useEffect(() => {
    if (isFormOpen && activeClinic) {
      fetchDoctors();
    }
  }, [isFormOpen, activeClinic]);

  const fetchDoctors = async () => {
    if (!activeClinic) {
      console.error('No active clinic available to fetch doctors');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('clinic_id', activeClinic.id);
        
      if (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Erro ao carregar médicos');
        return;
      }
      
      if (data) {
        // Convert the data to match our Doctor type
        const convertedDoctors = data.map(doctor => ({
          ...doctor,
          working_hours: doctor.working_hours ? doctor.working_hours as WorkingHours : undefined
        })) as Doctor[];
        setDoctors(convertedDoctors);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar médicos');
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
    if (!activeClinic) {
      toast.error('Por favor, selecione uma clínica primeiro');
      return;
    }
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };
  
  const handleCreateAppointment = async (formData: any) => {
    
    let doctorName = formData.doctor_name;
    if (formData.doctor_id && !doctorName) {
      const selectedDoctor = doctors.find(d => d.id === formData.doctor_id);
      doctorName = selectedDoctor?.name;
    }
    
    // Check for schedule blocks conflicts
    if (formData.doctor_id && formData.date && formData.time) {
      const appointmentDateTime = new Date(formData.date);
      const [hours, minutes] = formData.time.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Assume 1-hour appointment duration
      const endDateTime = new Date(appointmentDateTime);
      endDateTime.setHours(endDateTime.getHours() + 1);
      
      const isBlocked = isTimeSlotBlocked(
        formData.doctor_id,
        appointmentDateTime.toISOString(),
        endDateTime.toISOString()
      );
      
      if (isBlocked) {
        toast.error('Este horário está bloqueado para o profissional selecionado. Por favor, escolha outro horário.');
        return;
      }
    }
    
    try {
      createAppointment({
        patient_name: formData.patient_name,
        patient_phone: formData.patient_phone,
        patient_email: formData.patient_email,
        patient_cpf: formData.patient_cpf,
        doctor_id: formData.doctor_id,
        doctor_name: doctorName,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        notes: formData.notes
      });
      
      // Só fechar o modal após sucesso da criação
      setIsFormOpen(false);
      toast.success('Agendamento criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento. Tente novamente.');
    }
  };

  const handleDeleteAppointment = (id: string) => {
    deleteAppointment(id);
    setIsDetailsOpen(false);
  };


  const handleDeleteBlock = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este bloqueio?')) {
      deleteScheduleBlock(id);
    }
  };


  return (
    <DashboardLayout>
      {/* Header with enhanced calendar focus */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CalendarIcon className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-primary`} />
            <div>
              <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-foreground`}>
                Calendário
              </h1>
              <p className={`${isMobile ? 'text-base' : 'text-lg'} text-muted-foreground`}>
                {activeClinic 
                  ? `Visualize e gerencie todos os agendamentos da ${activeClinic.name}`
                  : 'Selecione uma clínica para gerenciar agendamentos'
                }
              </p>
            </div>
          </div>
          
          {activeClinic && (
            <Button type="button" onClick={handleOpenForm} size={isMobile ? "default" : "lg"}>
              <Plus className="h-5 w-5 mr-2" />
              Novo Agendamento
            </Button>
          )}
        </div>
      </div>
      
      {/* Calendar Views */}
      {activeClinic && (
        <GoogleCalendarView
          selectedDate={selectedDate || new Date()}
          onDateSelect={setSelectedDate}
          appointments={allAppointments}
          scheduleBlocks={scheduleBlocks}
          doctors={doctors}
          clinicId={activeClinic.id}
          selectedDoctorId={selectedDoctor}
          onNewAppointment={handleOpenForm}
          onEditAppointment={handleOpenDetails}
          onDeleteAppointment={handleDeleteAppointment}
          onDeleteBlock={handleDeleteBlock}
        />
      )}

      <AppointmentDetails
        appointment={selectedAppointment}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onConfirm={confirmAppointment}
        onCancel={cancelAppointment}
        onDelete={handleDeleteAppointment}
        onUpdateNotes={handleUpdateNotes}
      />

      <AppointmentFormSimple
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateAppointment}
        doctors={doctors}
        selectedDate={selectedDate}
        patients={patients}
      />
    </DashboardLayout>
  );
};

export default Calendar; 