import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Doctor } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentDetails } from '@/components/appointments/AppointmentDetails';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { useAppointments } from '@/hooks/useAppointments';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AppointmentCalendar } from '@/components/dashboard/AppointmentCalendar';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

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

  return (
    <DashboardLayout>
      <DashboardHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
