import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { webhookEvents } from '@/utils/webhook-service';
import { NotificationService } from '@/utils/notification-service';

export const useCreateAppointmentSimple = (clinicId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patient_name,
      patient_phone,
      patient_email,
      patient_cpf,
      doctor_id,
      doctor_name,
      date,
      time,
      type,
      notes,
    }: {
      patient_name: string;
      patient_phone?: string;
      patient_email?: string;
      patient_cpf?: string;
      doctor_id?: string;
      doctor_name?: string;
      date: Date;
      time: string;
      type: 'in-person' | 'online';
      notes?: string;
    }) => {
      if (!clinicId) throw new Error('Nenhuma clínica selecionada');
      if (!doctor_id) throw new Error('Nenhum profissional selecionado');
      if (!doctor_name) throw new Error('Nome do profissional é obrigatório');
      
      const [hours, minutes] = time.split(':').map(Number);
      const appointmentDate = new Date(date);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      console.log('Creating appointment with data:', {
        clinic_id: clinicId,
        patient_name,
        doctor_id,
        doctor_name,
        date: appointmentDate.toISOString(),
        type,
        notes,
        status: 'scheduled',
      });
      
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
          status: 'scheduled',
        })
        .select('*')
        .single();
        
      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }
      
      console.log('Appointment created successfully:', data);
      
      // Disparar webhook
      try {
        await webhookEvents.appointments.created(data, clinicId);
      } catch (webhookError) {
        console.warn('Webhook error (non-blocking):', webhookError);
      }

      // Criar paciente se não existir
      try {
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('id')
          .eq('clinic_id', clinicId)
          .eq('name', patient_name)
          .maybeSingle();
        
        if (!existingPatient && patient_phone && patient_email && patient_cpf) {
          const currentDate = new Date().toISOString().split('T')[0];
          
          const patientData = {
            clinic_id: clinicId,
            name: patient_name,
            phone: patient_phone,
            email: patient_email,
            cpf: patient_cpf,
            birth_date: currentDate,
            status: 'active'
          };
          
          console.log('Creating patient with data:', patientData);
          
          const { data: newPatient, error: patientError } = await supabase
            .from('patients')
            .insert(patientData)
            .select('*')
            .single();
            
          if (!patientError && newPatient) {
            console.log('Patient created successfully:', newPatient);
            await webhookEvents.patients.created(newPatient, clinicId);
            queryClient.invalidateQueries({ queryKey: ['patients', clinicId] });
          } else if (patientError) {
            console.warn('Error creating patient:', patientError);
          }
        }
      } catch (error) {
        console.warn('Error creating patient (non-blocking):', error);
      }

      // Enviar notificação
      try {
        if (patient_email) {
          const { data: clinic } = await supabase
            .from('clinics')
            .select('*')
            .eq('id', clinicId)
            .single();

          let doctor = null;
          if (doctor_id) {
            const { data: doctorData } = await supabase
              .from('doctors')
              .select('*')
              .eq('id', doctor_id)
              .single();
            doctor = doctorData;
          }

          if (clinic) {
            await NotificationService.sendAppointmentConfirmation(data, clinic, doctor);
          }
        }
      } catch (notificationError) {
        console.warn('Notification error (non-blocking):', notificationError);
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('Appointment creation successful');
      toast.success('Agendamento criado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao criar agendamento');
    },
  });
};