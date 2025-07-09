import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Doctor, Appointment, WorkingHours } from '@/types';
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
import { Calendar as CalendarIcon, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Calendar = () => {
  const { user } = useAuth();
  const { activeClinic } = useClinic();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'all'>('day');
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(!isMobile); // Fechado por padrão no mobile
  
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
            <Button onClick={handleOpenForm} size={isMobile ? "default" : "lg"}>
              <Plus className="h-5 w-5 mr-2" />
              {isMobile ? 'Novo Agendamento' : 'Novo Agendamento'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Layout with maximum calendar focus */}
      <div className="space-y-6">
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
                      onClick={handleOpenForm} 
                      className="w-full" 
                      size="lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Agendamento
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
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
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