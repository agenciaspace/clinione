
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { webhookEvents } from '@/utils/webhook-service';
import { useFinancialMutations } from '../useFinancialMutations';
import { useFinancialQueries } from '../../queries/useFinancialQueries';
import { addDays } from 'date-fns';

export const useCreateAppointment = (clinicId: string | undefined) => {
  const queryClient = useQueryClient();
  const { createFinancialForecast } = useFinancialMutations(clinicId);
  const { financialSettings, procedures } = useFinancialQueries(clinicId);

  return useMutation({
    mutationFn: async ({
      patient_name,
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

      if (procedure_id && appointmentValue) {
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
