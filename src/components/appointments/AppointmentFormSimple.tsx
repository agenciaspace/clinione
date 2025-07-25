import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogDescription as DialogDescription,
  ResponsiveDialogFooter as DialogFooter,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Doctor, Patient } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { cpfValidationRules, maskCPF } from '@/utils/cpf-validation';

const appointmentSchema = z.object({
  patient_name: z.string().min(3, { message: 'Nome do paciente é obrigatório' }),
  patient_phone: z.string().optional(),
  patient_email: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  patient_cpf: z.string().min(1, { message: 'CPF é obrigatório' }).refine(
    (cpf) => {
      const { validateCPF } = require('@/utils/cpf-validation');
      return validateCPF(cpf) === null;
    },
    { message: 'CPF inválido' }
  ),
  doctor_id: z.string().min(1, { message: 'Selecione um profissional' }),
  date: z.date().refine(date => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: 'A data deve ser hoje ou uma data futura',
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido. Use HH:MM',
  }),
  type: z.enum(['in-person', 'online']),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentFormSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormValues) => void;
  doctors: Doctor[];
  selectedDate?: Date;
  patients?: Patient[];
  preFilledPatient?: {
    name?: string;
    phone?: string;
    email?: string;
    cpf?: string;
  };
}

export function AppointmentFormSimple({ 
  isOpen, 
  onClose, 
  onSubmit, 
  doctors, 
  selectedDate,
  patients = [],
  preFilledPatient 
}: AppointmentFormSimpleProps) {
  const isMobile = useIsMobile();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isNewPatient, setIsNewPatient] = useState(!preFilledPatient);
  
  console.log('AppointmentFormSimple: Rendering with isOpen:', isOpen);
  console.log('AppointmentFormSimple: preFilledPatient:', preFilledPatient);
  console.log('AppointmentFormSimple: doctors count:', doctors.length);
  console.log('AppointmentFormSimple: patients count:', patients.length);
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_name: preFilledPatient?.name || '',
      patient_phone: preFilledPatient?.phone || '',
      patient_email: preFilledPatient?.email || '',
      patient_cpf: preFilledPatient?.cpf || '',
      doctor_id: '',
      date: selectedDate || new Date(),
      time: '09:00',
      type: 'in-person',
      notes: '',
    },
  });

  // Reset form when preFilledPatient changes
  useEffect(() => {
    if (preFilledPatient) {
      console.log('AppointmentFormSimple: Resetting form with patient data:', preFilledPatient);
      form.reset({
        patient_name: preFilledPatient.name || '',
        patient_phone: preFilledPatient.phone || '',
        patient_email: preFilledPatient.email || '',
        patient_cpf: preFilledPatient.cpf || '',
        doctor_id: '',
        date: selectedDate || new Date(),
        time: '09:00',
        type: 'in-person',
        notes: '',
      });
    }
  }, [preFilledPatient, selectedDate, form]);

  // Handle patient selection
  const handlePatientSelection = (patientId: string) => {
    setSelectedPatientId(patientId);
    
    if (patientId === 'new') {
      setIsNewPatient(true);
      form.reset({
        patient_name: '',
        patient_phone: '',
        patient_email: '',
        patient_cpf: '',
        doctor_id: form.getValues('doctor_id'),
        date: form.getValues('date'),
        time: form.getValues('time'),
        type: form.getValues('type'),
        notes: form.getValues('notes'),
      });
    } else {
      setIsNewPatient(false);
      const selectedPatient = patients.find(p => p.id === patientId);
      if (selectedPatient) {
        form.reset({
          patient_name: selectedPatient.name,
          patient_phone: selectedPatient.phone,
          patient_email: selectedPatient.email,
          patient_cpf: selectedPatient.cpf,
          doctor_id: form.getValues('doctor_id'),
          date: form.getValues('date'),
          time: form.getValues('time'),
          type: form.getValues('type'),
          notes: form.getValues('notes'),
        });
      }
    }
  };

  function handleSubmit(data: AppointmentFormValues) {
    console.log('AppointmentFormSimple: Submitting data:', data);
    
    // Validate doctor selection
    if (!data.doctor_id) {
      console.error('AppointmentFormSimple: No doctor selected');
      return;
    }
    
    // Find doctor name
    const selectedDoctor = doctors.find(d => d.id === data.doctor_id);
    if (!selectedDoctor) {
      console.error('AppointmentFormSimple: Selected doctor not found');
      return;
    }
    
    const finalData = {
      ...data,
      doctor_name: selectedDoctor.name,
    };
    
    console.log('AppointmentFormSimple: Final data with doctor name:', finalData);
    onSubmit(finalData);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => {
      console.log('AppointmentFormSimple: Dialog onOpenChange called with:', open);
      if (!open) onClose();
    }}>
      <DialogContent size="lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl">Novo Agendamento</DialogTitle>
          <DialogDescription className="text-sm">
            Preencha os dados para criar um novo agendamento
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Patient Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Selecionar Paciente</label>
              <Select
                value={selectedPatientId}
                onValueChange={handlePatientSelection}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione um paciente ou crie um novo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">+ Novo Paciente</SelectItem>
                  {patients.length === 0 ? (
                    <SelectItem value="" disabled>
                      Carregando pacientes...
                    </SelectItem>
                  ) : (
                    patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.cpf}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <FormField
              control={form.control}
              name="patient_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Nome do Paciente</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome completo" 
                      {...field} 
                      className="h-10" 
                      disabled={!isNewPatient}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patient_cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">CPF</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="000.000.000-00" 
                      {...field} 
                      className="h-10"
                      disabled={!isNewPatient}
                      onChange={(e) => {
                        const maskedValue = maskCPF(e.target.value);
                        field.onChange(maskedValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-4'}`}>
              <FormField
                control={form.control}
                name="patient_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Telefone (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000" 
                        {...field} 
                        className="h-10" 
                        disabled={!isNewPatient}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="patient_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">E-mail (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@exemplo.com" 
                        type="email" 
                        {...field} 
                        className="h-10" 
                        disabled={!isNewPatient}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="doctor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Profissional *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.length > 0 ? (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Nenhum profissional encontrado
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-4'}`}>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm">Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal h-10 justify-start"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd 'de' MMMM", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          locale={ptBR}
                          initialFocus
                          className={isMobile ? 'scale-90' : ''}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Horário</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="HH:MM" 
                          {...field} 
                          className="pl-10 h-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Tipo de Consulta</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="in-person">Presencial</SelectItem>
                      <SelectItem value="online">Teleconsulta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre a consulta..." 
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className={`${isMobile ? 'flex-col gap-2' : 'flex-row gap-2'} pt-4`}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className={`${isMobile ? 'w-full order-2' : 'w-auto'}`}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className={`${isMobile ? 'w-full order-1' : 'w-auto'}`}
              >
                Criar Agendamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}