import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { webhookEvents } from '@/utils/webhook-service';
import { NotificationService } from '@/utils/notification-service';
import { useFinancialMutations } from '../useFinancialMutations';
import { useFinancialQueries } from '../../queries/useFinancialQueries';
import { addDays } from 'date-fns';

export const useCreateAppointment = (clinicId: string | undefined) => {
  const queryClient = useQueryClient();
  
  // Make financial queries optional to avoid blocking appointment creation
  let createFinancialForecast: any = null;
  let financialSettings: any = null;
  let procedures: any[] = [];
  
  try {
    const financialMutations = useFinancialMutations(clinicId);
    createFinancialForecast = financialMutations.createFinancialForecast;
    
    const financialQueries = useFinancialQueries(clinicId);
    financialSettings = financialQueries.financialSettings;
    procedures = financialQueries.procedures;
  } catch (error) {
    console.warn('Financial features not available:', error);
  }

  return useMutation({
    mutationFn: async ({
      patient_name,
      patient_phone,
      patient_email,
      doctor_id,
      doctor_name,
      date,
      time,
      type,
      notes,
      procedure_id,
      payment_type = 'private',
      insurance_company_id
    }: {
      patient_name: string;
      patient_phone?: string;
      patient_email?: string;
      doctor_id?: string;
      doctor_name?: string;
      date: Date;
      time: string;
      type: 'in-person' | 'online';
      notes?: string;
      procedure_id?: string;
      payment_type?: 'private' | 'insurance';
      insurance_company_id?: string;
    }) => {
      if (!clinicId) throw new Error('Nenhuma clínica selecionada');
      
      const [hours, minutes] = time.split(':').map(Number);
      const appointmentDate = new Date(date);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      let appointmentValue: number | undefined;
      if (procedure_id) {
        const procedure = procedures.find(p => p.id === procedure_id);
        if (procedure) {
          appointmentValue = payment_type === 'private' 
            ? procedure.value_private 
            : (procedure.value_insurance || procedure.value_private);
        }
      }
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          clinic_id: clinicId,
          patient_name,
          patient_phone,
          patient_email,
          doctor_id,
          doctor_name,
          date: appointmentDate.toISOString(),
          type,
          notes,
          status: 'scheduled',
          procedure_id,
          payment_type,
          insurance_company_id,
          value: appointmentValue
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      await webhookEvents.appointments.created(data, clinicId);

      // Criar paciente se não existir
      try {
        // Verificar se paciente já existe por nome na mesma clínica
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('id')
          .eq('clinic_id', clinicId)
          .eq('name', patient_name)
          .maybeSingle();
        
        if (!existingPatient) {
          // Criar novo paciente com data de nascimento padrão
          const currentDate = new Date().toISOString().split('T')[0];
          
          const patientData = {
            clinic_id: clinicId,
            name: patient_name,
            phone: patient_phone || '',
            email: patient_email || '',
            birth_date: currentDate,
            status: 'active'
          };
          
          const { data: newPatient, error: patientError } = await supabase
            .from('patients')
            .insert(patientData)
            .select('*')
            .single();
            
          if (!patientError && newPatient) {
            // Disparar evento de webhook para criação de paciente
            await webhookEvents.patients.created(newPatient, clinicId);
            
            // Invalidar cache de pacientes para atualizar a lista
            queryClient.invalidateQueries({ queryKey: ['patients', clinicId] });
          } else if (patientError) {
            console.error('Erro ao criar paciente:', patientError);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar/criar paciente:', error);
        // Não interromper o fluxo se falhar a criação do paciente
      }

      // Create financial forecast if available and configured
      if (procedure_id && appointmentValue && createFinancialForecast) {
        try {
          let expectedPaymentDate: Date;
          
          if (payment_type === 'private') {
            expectedPaymentDate = new Date(appointmentDate);
          } else {
            const paymentTerm = financialSettings?.default_insurance_payment_term || 30;
            expectedPaymentDate = addDays(appointmentDate, paymentTerm);
          }
          
          await createFinancialForecast({
            appointment_id: data.id,
            payment_type,
            description: `Consulta: ${patient_name} - ${new Date(data.date).toLocaleDateString()}`,
            value: appointmentValue,
            expected_payment_date: expectedPaymentDate.toISOString(),
            status: 'forecast',
            procedure_id,
            insurance_company_id,
            doctor_id
          });
        } catch (error) {
          console.warn('Failed to create financial forecast:', error);
          // Continue with appointment creation even if forecast fails
        }
      }

      // Enviar notificação de confirmação de agendamento
      try {
        if (patient_email) {
          // Buscar dados da clínica
          const { data: clinic } = await supabase
            .from('clinics')
            .select('*')
            .eq('id', clinicId)
            .single();

          // Buscar dados do médico se especificado
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
        console.error('Erro ao enviar notificação de agendamento:', notificationError);
        // Não interromper o fluxo se falhar o envio da notificação
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
};
