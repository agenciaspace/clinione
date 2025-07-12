import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Stethoscope, FileText, Clock, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDoctor } from '@/hooks/useDoctor';
import { CIDSearchInput } from './CIDSearchInput';
import { MedicalRecordEditor } from './MedicalRecordEditor';
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
}

interface NewMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicId: string;
  onSuccess: () => void;
}

export const NewMedicalRecordModalWithAutoSave: React.FC<NewMedicalRecordModalProps> = ({
  isOpen,
  onClose,
  clinicId,
  onSuccess
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCID, setSelectedCID] = useState<{ code: string; description: string } | null>(null);
  const [recordContent, setRecordContent] = useState('');
  const isMobile = useIsMobile();
  
  const { 
    currentDoctor, 
    isDoctorRole,
    canSelectAnyDoctor 
  } = useDoctor();

  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patient_id: '',
      doctor_id: currentDoctor?.id || '',
      appointment_date: format(new Date(), 'yyyy-MM-dd'),
      appointment_time: format(new Date(), 'HH:mm'),
      appointment_type: 'in-person',
      cid_code: '',
      cid_description: '',
      description: ''
    }
  });

  // Load patients and doctors when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPatients();
      loadDoctors();
    }
  }, [isOpen, clinicId]);

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, email, phone, cpf')
        .eq('clinic_id', clinicId)
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Erro ao carregar pacientes');
    }
  };

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, name')
        .eq('clinic_id', clinicId)
        .order('name');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      toast.error('Erro ao carregar médicos');
    }
  };

  const generateUniqueKey = (formData: MedicalRecordFormData) => {
    // Create a unique key for this new record based on patient and date
    return `new_record_${formData.patient_id}_${formData.appointment_date}_${formData.appointment_time}`;
  };

  const onSubmit = async (data: MedicalRecordFormData) => {
    if (!recordContent.trim()) {
      toast.error('Por favor, adicione o conteúdo do prontuário');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Combine CID info with description
      let notesContent = recordContent;
      if (selectedCID?.code && selectedCID?.description) {
        notesContent += `\n\nCID: ${selectedCID.code} - ${selectedCID.description}`;
      }

      // Create appointment with medical record
      const appointmentDateTime = new Date(`${data.appointment_date}T${data.appointment_time}`);
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_name: patients.find(p => p.id === data.patient_id)?.name || '',
          phone: patients.find(p => p.id === data.patient_id)?.phone || '',
          email: patients.find(p => p.id === data.patient_id)?.email || '',
          doctor_id: data.doctor_id,
          doctor_name: doctors.find(d => d.id === data.doctor_id)?.name || '',
          clinic_id: clinicId,
          date: appointmentDateTime.toISOString(),
          type: data.appointment_type,
          status: 'completed',
          notes: notesContent
        });

      if (error) throw error;

      toast.success('Prontuário criado com sucesso!');
      
      // Clear the auto-save draft since we successfully saved
      const draftKey = generateUniqueKey(data);
      localStorage.removeItem(`autosave_${draftKey}`);
      
      onSuccess();
      onClose();
      form.reset();
      setRecordContent('');
      setSelectedCID(null);
    } catch (error) {
      console.error('Error creating medical record:', error);
      toast.error('Erro ao criar prontuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Don't clear the draft when closing - auto-save will handle it
    onClose();
  };

  const selectedPatient = patients.find(p => p.id === form.watch('patient_id'));
  const formData = form.watch();
  const uniqueKey = formData.patient_id && formData.appointment_date && formData.appointment_time 
    ? generateUniqueKey(formData) 
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl max-h-[90vh]'} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Novo Prontuário Médico</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient and Doctor Selection */}
            <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}`}>
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{patient.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {patient.phone} • {patient.email}
                              </span>
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
                    <FormLabel>Médico</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
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
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Time */}
            <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-3 gap-4'}`}>
              <FormField
                control={form.control}
                name="appointment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Consulta</FormLabel>
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
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Consulta</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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

            {/* CID Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Classificação CID (Opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <CIDSearchInput
                  value={selectedCID?.code || ''}
                  description={selectedCID?.description || ''}
                  onSelect={(cid) => {
                    setSelectedCID(cid);
                    form.setValue('cid_code', cid.code);
                    form.setValue('cid_description', cid.description);
                  }}
                  onClear={() => {
                    setSelectedCID(null);
                    form.setValue('cid_code', '');
                    form.setValue('cid_description', '');
                  }}
                />
              </CardContent>
            </Card>

            {/* Medical Record Content with Auto-Save */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Descrição do Prontuário</span>
                  <Badge variant="secondary" className="text-xs">
                    <Save className="h-3 w-3 mr-1" />
                    Auto-save Ativo
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {uniqueKey && selectedPatient ? (
                  <MedicalRecordEditor
                    patientId={selectedPatient.id}
                    recordId={uniqueKey} // Use as record ID for draft identification
                    initialContent=""
                    onContentChange={(content) => setRecordContent(content)}
                    placeholder="Descreva os sintomas, diagnóstico, tratamento prescrito e outras observações relevantes..."
                  />
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p>Selecione um paciente e defina a data para ativar o editor com auto-save</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patient Info Summary */}
            {selectedPatient && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Resumo da Consulta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span><strong>Paciente:</strong> {selectedPatient.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span><strong>Data:</strong> {format(new Date(`${form.watch('appointment_date')}T${form.watch('appointment_time')}`), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="h-4 w-4" />
                      <span><strong>Médico:</strong> {doctors.find(d => d.id === form.watch('doctor_id'))?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span><strong>Tipo:</strong> {form.watch('appointment_type') === 'in-person' ? 'Presencial' : 'Online'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !recordContent.trim()}
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Salvando...' : 'Criar Prontuário'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
