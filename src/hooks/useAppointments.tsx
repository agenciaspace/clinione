
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Appointment } from '@/types';
import { useClinic } from '@/contexts/ClinicContext';
import { endOfMonth, startOfMonth } from 'date-fns';

export const useAppointments = (selectedDate?: Date | null, doctorId?: string | null) => {
  const { activeClinic } = useClinic();
  const queryClient = useQueryClient();
  const clinicId = activeClinic?.id;

  // Função para buscar agendamentos de um dia específico
  const fetchAppointments = async () => {
    if (!clinicId || !selectedDate) return [];

    const dateStart = new Date(selectedDate);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(selectedDate);
    dateEnd.setHours(23, 59, 59, 999);
    
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('date', dateStart.toISOString())
      .lte('date', dateEnd.toISOString());
      
    if (doctorId && doctorId !== 'all') {
      query = query.eq('doctor_id', doctorId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
    
    return data as Appointment[];
  };

  // Função para buscar todos os agendamentos do mês
  const fetchMonthAppointments = async (date: Date) => {
    if (!clinicId || !date) return [];

    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('date', monthStart.toISOString())
      .lte('date', monthEnd.toISOString());
      
    if (doctorId && doctorId !== 'all') {
      query = query.eq('doctor_id', doctorId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching month appointments:', error);
      throw error;
    }
    
    return data as Appointment[];
  };

  // Query para buscar agendamentos do dia
  const {
    data: appointments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['appointments', clinicId, selectedDate?.toISOString(), doctorId],
    queryFn: fetchAppointments,
    enabled: !!clinicId && !!selectedDate,
  });

  // Query para buscar agendamentos do mês
  const {
    data: monthAppointments = [],
  } = useQuery({
    queryKey: ['month-appointments', clinicId, selectedDate ? startOfMonth(selectedDate).toISOString() : null, doctorId],
    queryFn: () => selectedDate ? fetchMonthAppointments(selectedDate) : Promise.resolve([]),
    enabled: !!clinicId && !!selectedDate,
  });

  // Mutation para criar um novo agendamento
  const createAppointment = useMutation({
    mutationFn: async ({
      patient_name,
      doctor_id,
      doctor_name,
      date,
      time,
      type,
      notes
    }: {
      patient_name: string;
      doctor_id?: string;
      doctor_name?: string;
      date: Date;
      time: string;
      type: 'in-person' | 'online';
      notes?: string;
    }) => {
      if (!clinicId) throw new Error('Nenhuma clínica selecionada');
      
      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const appointmentDate = new Date(date);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          clinic_id: clinicId,
          patient_name,
          doctor_id,
          doctor_name,
          date: appointmentDate.toISOString(),
          type,
          notes,
          status: 'scheduled'
        })
        .select('*')
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Agendamento criado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao criar agendamento');
    },
  });

  // Mutation para confirmar agendamento
  const confirmAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      return id;
    },
    onSuccess: (id) => {
      toast.success('Agendamento confirmado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Error confirming appointment:', error);
      toast.error('Erro ao confirmar agendamento');
    },
  });

  // Mutation para cancelar agendamento
  const cancelAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      return id;
    },
    onSuccess: (id) => {
      toast.success('Agendamento cancelado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Error cancelling appointment:', error);
      toast.error('Erro ao cancelar agendamento');
    },
  });

  // Mutation para atualizar observações do agendamento
  const updateAppointmentNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ notes })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      return { id, notes };
    },
    onSuccess: () => {
      toast.success('Observações atualizadas com sucesso');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Error updating appointment notes:', error);
      toast.error('Erro ao atualizar observações');
    },
  });

  // Configuração do listener de tempo real para agendamentos
  useEffect(() => {
    if (!clinicId) return;

    const channel = supabase
      .channel('appointment-changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `clinic_id=eq.${clinicId}`
        }, 
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinicId, queryClient]);

  return {
    appointments,
    monthAppointments,
    isLoading,
    error,
    refetch,
    createAppointment: (data: {
      patient_name: string;
      doctor_id?: string;
      doctor_name?: string;
      date: Date;
      time: string;
      type: 'in-person' | 'online';
      notes?: string;
    }) => createAppointment.mutate(data),
    confirmAppointment: (id: string) => confirmAppointment.mutate(id),
    cancelAppointment: (id: string) => cancelAppointment.mutate(id),
    updateAppointmentNotes: (id: string, notes: string) => 
      updateAppointmentNotes.mutate({ id, notes }),
  };
};
