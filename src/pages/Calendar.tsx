import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Doctor, Appointment, WorkingHours, ScheduleBlock } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentDetails } from '@/components/appointments/AppointmentDetails';
import { AppointmentFormSimple } from '@/components/appointments/AppointmentFormSimple';
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentCalendar } from '@/components/dashboard/AppointmentCalendar';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePatients } from '@/hooks/usePatients';
import { useScheduleBlocks } from '@/hooks/useScheduleBlocks';
import { Calendar as CalendarIcon, Plus, ChevronDown, ChevronUp, Shield, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScheduleBlockManager } from '@/components/appointments/ScheduleBlockManager';
import { ScheduleBlocksList } from '@/components/appointments/ScheduleBlocksList';
import { GoogleCalendarView } from '@/components/calendar/GoogleCalendarView';
import { toast } from '@/components/ui/sonner';

const Calendar = () => {
  const { user } = useAuth();
  const { activeClinic } = useClinic();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'all'>('day');
  const [calendarView, setCalendarView] = useState<'compact' | 'expanded'>('compact');
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(!isMobile); // Fechado por padrão no mobile
  const [isScheduleBlocksOpen, setIsScheduleBlocksOpen] = useState(false);
  
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

  const { patients } = usePatients(activeClinic?.id);
  const { getBlocksForDateRange, isTimeSlotBlocked, scheduleBlocks, updateScheduleBlock, deleteScheduleBlock } = useScheduleBlocks(activeClinic?.id, selectedDoctor);

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
        // Convert the data to match our Doctor type
        const convertedDoctors = data.map(doctor => ({
          ...doctor,
          working_hours: doctor.working_hours ? doctor.working_hours as WorkingHours : undefined
        })) as Doctor[];
        setDoctors(convertedDoctors);
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
    console.log('Calendar: handleCreateAppointment called with:', formData);
    
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
    
    await createAppointment({
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
    
    setIsFormOpen(false);
  };

  const handleDeleteAppointment = (id: string) => {
    deleteAppointment(id);
    setIsDetailsOpen(false);
  };

  const handleEditBlock = (block: ScheduleBlock) => {
    // TODO: Implement edit block functionality
    console.log('Edit block:', block);
  };

  const handleDeleteBlock = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este bloqueio?')) {
      deleteScheduleBlock(id);
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

  const hasScheduleBlocksOnDate = (date: Date) => {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    
    const blocks = getBlocksForDateRange(
      dateStart.toISOString(), 
      dateEnd.toISOString(), 
      selectedDoctor && selectedDoctor !== 'all' ? selectedDoctor : undefined
    );
    
    return blocks.length > 0;
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
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size={isMobile ? "default" : "lg"}
                onClick={() => setCalendarView(calendarView === 'compact' ? 'expanded' : 'compact')}
              >
                {calendarView === 'compact' ? (
                  <>
                    <Grid className="h-4 w-4 mr-2" />
                    {!isMobile && 'Expandir'}
                  </>
                ) : (
                  <>
                    <List className="h-4 w-4 mr-2" />
                    {!isMobile && 'Compacto'}
                  </>
                )}
              </Button>
              <Button type="button" onClick={handleOpenForm} size={isMobile ? "default" : "lg"}>
                <Plus className="h-5 w-5 mr-2" />
                {isMobile ? 'Novo Agendamento' : 'Novo Agendamento'}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Layout with maximum calendar focus */}
      <div className="space-y-6">
        {/* Expanded Calendar View */}
        {calendarView === 'expanded' && activeClinic && (
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

        {/* Compact Calendar View */}
        {calendarView === 'compact' && (
          <div>
        {/* Calendar Section - Takes full width and prominence */}
        <div className="w-full">
          <Card className="shadow-lg border-2">
            <CardContent className="p-6 sm:p-8">
              <div className={`${
                isMobile 
                  ? 'space-y-6' 
                  : 'grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'
              }`}>
                {/* Calendar takes center stage */}
                <div className={`${isMobile ? 'order-1' : 'lg:col-span-2'} flex justify-center`}>
                  <div className="w-full max-w-md lg:max-w-lg">
                    <AppointmentCalendar
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      selectedDoctor={selectedDoctor}
                      setSelectedDoctor={setSelectedDoctor}
                      doctors={doctors}
                      view={view}
                      setView={setView}
                      hasAppointmentsOnDate={hasAppointmentsOnDate}
                      hasScheduleBlocksOnDate={hasScheduleBlocksOnDate}
                    />
                  </div>
                </div>

                {/* Quick stats and info */}
                <div className={`${isMobile ? 'order-2' : 'lg:col-span-1'} space-y-4`}>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg border">
                    <h3 className="font-semibold text-lg mb-3">Resumo do Dia</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total de agendamentos:</span>
                        <span className="font-semibold text-lg">{appointments.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Profissionais ativos:</span>
                        <span className="font-semibold text-lg">{doctors.length}</span>
                      </div>
                      {selectedDate && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium text-primary">
                            {selectedDate.toLocaleDateString('pt-BR', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick actions */}
                  <div className="space-y-2">
                    <Button 
                      type="button"
                      onClick={handleOpenForm} 
                      className="w-full" 
                      size="lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Agendamento
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setIsScheduleBlocksOpen(!isScheduleBlocksOpen)} 
                      className="w-full" 
                      variant="outline"
                      size="lg"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Bloqueios de Agenda
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List - Collapsible on mobile, always visible on desktop */}
        <Collapsible 
          open={isAppointmentsOpen} 
          onOpenChange={setIsAppointmentsOpen}
          className="w-full"
        >
          <Card>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-0 h-auto hover:bg-transparent"
                >
                  <CardTitle className="flex items-center text-xl">
                    Agendamentos
                    {selectedDate && (
                      <span className="ml-2 text-base font-normal text-muted-foreground">
                        ({appointments.length} {view === 'day' ? 'hoje' : view === 'week' ? 'esta semana' : 'total'})
                      </span>
                    )}
                  </CardTitle>
                  {isMobile && (
                    isAppointmentsOpen ? 
                      <ChevronUp className="h-5 w-5" /> : 
                      <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <AppointmentList
                  appointments={appointments}
                  allAppointments={allAppointments}
                  isLoading={isLoading}
                  view={view}
                  onOpenForm={handleOpenForm}
                  onOpenDetails={handleOpenDetails}
                  onConfirm={confirmAppointment}
                  onCancel={cancelAppointment}
                  selectedDate={selectedDate}
                />
                
                {/* Show active schedule blocks for selected date */}
                {selectedDate && activeClinic && (
                  <ScheduleBlocksList
                    clinicId={activeClinic.id}
                    selectedDate={selectedDate}
                    selectedDoctor={selectedDoctor}
                    doctors={doctors}
                  />
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Schedule Blocks Section */}
        <Collapsible 
          open={isScheduleBlocksOpen} 
          onOpenChange={setIsScheduleBlocksOpen}
          className="w-full"
        >
          <Card>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-0 h-auto hover:bg-transparent"
                >
                  <CardTitle className="flex items-center text-xl">
                    <Shield className="h-5 w-5 mr-2" />
                    Bloqueios de Agenda
                  </CardTitle>
                  {isScheduleBlocksOpen ? 
                    <ChevronUp className="h-5 w-5" /> : 
                    <ChevronDown className="h-5 w-5" />
                  }
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {activeClinic && (
                  <ScheduleBlockManager
                    clinicId={activeClinic.id}
                    doctors={doctors}
                    selectedDoctorId={selectedDoctor}
                  />
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
        </div>
        )}
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