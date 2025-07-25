import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Stethoscope, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDoctor } from '@/hooks/useDoctor';
import { CIDSearchInput } from './CIDSearchInput';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

const medicalRecordSchema = z.object({
  patient_id: z.string().min(1, 'Selecione um paciente'),
  doctor_id: z.string().min(1, 'Selecione um médico'),
  appointment_date: z.string().min(1, 'Selecione a data da consulta'),
  appointment_time: z.string().min(1, 'Selecione o horário'),
  appointment_type: z.enum(['in-person', 'online'], {
    required_error: 'Selecione o tipo de consulta'
  }),
  cid_code: z.string().optional(),
  cid_description: z.string().optional(),
  description: z.string().min(1, 'Informe a descrição do prontuário')
});

type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>;

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface Doctor {
  id: string;
  name: string;
  speciality: string;
}

interface NewMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicId: string;
  onSuccess: () => void;
}

export const NewMedicalRecordModal: React.FC<NewMedicalRecordModalProps> = ({
  isOpen,
  onClose,
  clinicId,
  onSuccess
}) => {
  const isMobile = useIsMobile();
  const { currentDoctor, isDoctorRole, canSelectAnyDoctor } = useDoctor();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patient_id: '',
      doctor_id: isDoctorRole && currentDoctor && !canSelectAnyDoctor ? currentDoctor.id : '',
      appointment_date: new Date().toISOString().split('T')[0], // Data de hoje no formato YYYY-MM-DD
      appointment_time: '',
      appointment_type: 'in-person',
      cid_code: '',
      cid_description: '',
      description: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      fetchDoctors();
    }
  }, [isOpen, clinicId, canSelectAnyDoctor, isDoctorRole]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, email, phone, cpf')
        .eq('clinic_id', clinicId)
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching patients:', error);
        return;
      }

      setPatients(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      let doctorsData = [];
      
      if (canSelectAnyDoctor) {
        // Owners, admins and staff can select any doctor
        const { data, error } = await supabase
          .from('doctors')
          .select('id, name, speciality')
          .eq('clinic_id', clinicId)
          .order('name');

        if (error) {
          console.error('Error fetching doctors:', error);
          return;
        }

        doctorsData = data || [];
      } else if (isDoctorRole && currentDoctor) {
        // Doctors can only create records for themselves
        doctorsData = [{
          id: currentDoctor.id,
          name: currentDoctor.name,
          speciality: currentDoctor.speciality
        }];
      }

      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const onSubmit = async (data: MedicalRecordFormData) => {
    setIsSubmitting(true);
    
    try {
      // Combinar data e horário
      const appointmentDateTime = new Date(`${data.appointment_date}T${data.appointment_time}`);
      
      // Buscar informações do paciente e médico
      const selectedPatient = patients.find(p => p.id === data.patient_id);
      const selectedDoctor = doctors.find(d => d.id === data.doctor_id);

      if (!selectedPatient || !selectedDoctor) {
        toast.error('Erro ao buscar informações do paciente ou médico');
        return;
      }

      // Criar o appointment primeiro
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          clinic_id: clinicId,
          patient_name: selectedPatient.name,
          email: selectedPatient.email, // Use 'email' instead of 'patient_email'
          phone: selectedPatient.phone, // Use 'phone' instead of 'patient_phone'
          doctor_id: data.doctor_id,
          doctor_name: selectedDoctor.name,
          date: appointmentDateTime.toISOString(),
          type: data.appointment_type,
          status: 'completed',
          notes: `${data.description}${data.cid_code && data.cid_description ? `\n\nCID: ${data.cid_code} - ${data.cid_description}` : ''}`
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        toast.error('Erro ao criar prontuário: ' + appointmentError.message);
        return;
      }

      toast.success('Prontuário criado com sucesso!');
      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating medical record:', error);
      toast.error('Erro inesperado ao criar prontuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // Gerar opções de horário (de 07:00 às 18:00, de 30 em 30 minutos)
  const timeOptions = [];
  for (let hour = 7; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh]' : 'sm:max-w-4xl max-h-[90vh]'} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Novo Prontuário</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações da Consulta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  <span>Informações da Consulta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}`}>
                  <FormField
                    control={form.control}
                    name="patient_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paciente *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o paciente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                <div>
                                  <div className="font-medium">{patient.name}</div>
                                  <div className="text-sm text-gray-500">{patient.email}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doctor_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Médico *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isDoctorRole && !canSelectAnyDoctor}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o médico" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                <div>
                                  <div className="font-medium">Dr. {doctor.name}</div>
                                  <div className="text-sm text-gray-500">{doctor.speciality}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-3 gap-4'}`}>
                  <FormField
                    control={form.control}
                    name="appointment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da Consulta *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appointment_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o horário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appointment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo de consulta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in-person">Presencial</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Prontuário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Stethoscope className="h-5 w-5" />
                  <span>Prontuário</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Prontuário *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o atendimento, diagnóstico, tratamento, orientações..."
                          {...field}
                          rows={8}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cid_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CID-10 (Classificação Internacional de Doenças)</FormLabel>
                      <FormControl>
                        <CIDSearchInput
                          value={field.value}
                          description={form.watch('cid_description')}
                          onSelect={(code, description) => {
                            form.setValue('cid_code', code);
                            form.setValue('cid_description', description);
                          }}
                          onClear={() => {
                            form.setValue('cid_code', '');
                            form.setValue('cid_description', '');
                          }}
                          placeholder="Buscar código CID-10..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar Prontuário'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};