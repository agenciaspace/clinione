import React, { useState, ReactNode, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, Loader2, User, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { webhookEvents } from '@/utils/webhook-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppointmentSchedulerProps {
  clinicId: string;
  trigger?: ReactNode;
}

interface AppointmentFormData {
  patient_name: string;
  phone: string;
  email: string;
  notes: string;
}

interface Doctor {
  id: string;
  name: string;
  speciality?: string;
}

export const AppointmentScheduler = ({ clinicId, trigger }: AppointmentSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start_time: string;
    end_time: string;
    doctor_id: string;
    doctor_name: string;
  } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Passar o selectedDoctor para o hook useAvailableSlots
  const { slots, isLoading, error, refetch } = useAvailableSlots(
    clinicId, 
    selectedDate, 
    selectedDoctor || undefined
  );

  useEffect(() => {
    if (open && !selectedDate) {
      const today = new Date();
      setSelectedDate(today);
    }
    
    // Carregar médicos
    const loadDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('id, name, speciality')
          .eq('clinic_id', clinicId);
          
        if (error) {
          console.error('Erro ao carregar médicos:', error);
          return;
        }
        
        if (data && data.length > 0) {
          setDoctors(data);
          console.log('Médicos carregados:', data);
        }
      } catch (err) {
        console.error('Erro ao buscar médicos:', err);
      }
    };
    
    if (open && clinicId) {
      loadDoctors();
    }
  }, [open, selectedDate, clinicId]);

  useEffect(() => {
    if (selectedDate) {
      console.log(`Slots carregados para ${selectedDate.toISOString().split('T')[0]}:`, slots?.length || 0);
      // Forçar refetch quando a data ou médico mudar
      refetch();
    }
  }, [selectedDate, selectedDoctor, refetch]);

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    setFormOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot) return;
    
    setIsSubmitting(true);
    
    try {
      const appointmentDate = new Date(selectedSlot.start_time);
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          clinic_id: clinicId,
          patient_name: formData.patient_name,
          doctor_id: selectedSlot.doctor_id,
          doctor_name: selectedSlot.doctor_name,
          date: appointmentDate.toISOString(),
          notes: formData.notes,
          type: 'in-person',
          status: 'scheduled',
          phone: formData.phone,
          email: formData.email
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Disparar evento de webhook para a criação de agendamento
      await webhookEvents.appointments.created(data, clinicId);
      
      // Também criar um paciente se ele não existir
      // Verificar se paciente já existe por email ou telefone
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('clinic_id', clinicId)
        .or(`email.eq.${formData.email},phone.eq.${formData.phone}`)
        .maybeSingle();
      
      if (!existingPatient) {
        // Definimos uma data de nascimento padrão para satisfazer a restrição NOT NULL
        // No caso de um agendamento online onde não coletamos esse dado
        const currentDate = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        
        const patientData = {
          clinic_id: clinicId,
          name: formData.patient_name,
          phone: formData.phone,
          email: formData.email,
          birth_date: currentDate // Campo obrigatório adicionado
        };
        
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert(patientData)
          .select('*')
          .single();
          
        if (!patientError && newPatient) {
          // Disparar evento de webhook para criação de paciente
          await webhookEvents.patients.created(newPatient, clinicId);
        } else if (patientError) {
          console.error('Erro ao criar paciente:', patientError);
        }
      }
      
      setFormData({
        patient_name: '',
        phone: '',
        email: '',
        notes: ''
      });
      
      setIsSuccess(true);
      setFormOpen(false);
      refetch();
      
      toast.success('Agendamento realizado com sucesso!', {
        description: `Sua consulta foi agendada para ${format(appointmentDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}`
      });
      
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao agendar consulta', {
        description: 'Tente novamente em alguns instantes'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setFormOpen(false);
    setIsSuccess(false);
    setFormData({
      patient_name: '',
      phone: '',
      email: '',
      notes: ''
    });
    setSelectedDoctor(null);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetState, 300);
  };

  const renderSlots = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-6 sm:p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm text-gray-600">Carregando horários...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-6 sm:p-8">
          <p className="text-red-500 text-sm">Erro ao carregar horários disponíveis</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            className="mt-2"
          >
            Tentar novamente
          </Button>
        </div>
      );
    }

    if (!slots || slots.length === 0) {
      return (
        <div className="text-center p-6 sm:p-8">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            Nenhum horário disponível para esta data
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Tente selecionar outra data
          </p>
        </div>
      );
    }

    return (
      <div className={`grid gap-2 sm:gap-3 ${
        isMobile ? 'grid-cols-2' : 'grid-cols-3'
      } max-h-64 overflow-y-auto p-2`}>
        {slots.map((slot, index) => (
          <Button
            key={index}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={() => handleSlotSelect(slot)}
            className="flex flex-col items-center justify-center h-auto py-2 sm:py-3 text-xs sm:text-sm"
          >
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mb-1" />
            <span className="font-medium">
              {format(new Date(slot.start_time), 'HH:mm')}
            </span>
            <span className="text-xs text-gray-500 truncate max-w-full">
              {slot.doctor_name}
            </span>
          </Button>
        ))}
      </div>
    );
  };

  function renderFormContent() {
    if (isSuccess) {
      return (
        <div className="text-center p-6 sm:p-8 space-y-4">
          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto" />
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Agendamento Confirmado!
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Sua consulta foi agendada com sucesso.
            </p>
          </div>
          <Button onClick={handleClose} className="w-full">
            Fechar
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center border-b pb-3 sm:pb-4">
          <h3 className="text-lg sm:text-xl font-semibold">Dados para agendamento</h3>
          {selectedSlot && (
            <p className="text-sm text-gray-600 mt-1">
              {format(new Date(selectedSlot.start_time), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              <br />
              <span className="font-medium">{selectedSlot.doctor_name}</span>
            </p>
          )}
        </div>
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="patient_name" className="text-sm font-medium">
                Nome completo *
              </Label>
              <Input
                id="patient_name"
                name="patient_name"
                value={formData.patient_name}
                onChange={handleFormChange}
                placeholder="Seu nome completo"
                required
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefone *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="(11) 99999-9999"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="seu@email.com"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Observações
              </Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Informações adicionais (opcional)"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Agendando...
                </>
              ) : (
                'Confirmar agendamento'
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const DialogOrSheet = isMobile ? Sheet : Dialog;
  const DialogOrSheetContent = isMobile ? SheetContent : DialogContent;
  const DialogOrSheetHeader = isMobile ? SheetHeader : DialogHeader;
  const DialogOrSheetTitle = isMobile ? SheetTitle : DialogTitle;

  return (
    <DialogOrSheet open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      
      <DialogOrSheetContent className={`${
        isMobile 
          ? 'h-[95vh] overflow-y-auto' 
          : 'max-w-2xl max-h-[90vh] overflow-y-auto'
      }`}>
        <DialogOrSheetHeader className="pb-4">
          <DialogOrSheetTitle className="flex items-center text-lg sm:text-xl">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Agendar Consulta
          </DialogOrSheetTitle>
          {!isMobile && (
            <DialogDescription className="text-sm text-gray-600">
              Selecione uma data e horário para sua consulta
            </DialogDescription>
          )}
        </DialogOrSheetHeader>

        {!formOpen ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Doctor Filter */}
            {doctors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Profissional (opcional)</Label>
                <Select value={selectedDoctor || ''} onValueChange={(value) => setSelectedDoctor(value || null)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos os profissionais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os profissionais</SelectItem>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                        {doctor.speciality && (
                          <span className="text-xs text-gray-500 ml-1">
                            - {doctor.speciality}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Calendar */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Selecione uma data</Label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ptBR}
                  disabled={(date) => date < new Date()}
                  className={`border rounded-md ${isMobile ? 'scale-90' : ''}`}
                />
              </div>
            </div>

            {/* Available Slots */}
            {selectedDate && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Horários disponíveis - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </Label>
                {renderSlots()}
              </div>
            )}
          </div>
        ) : (
          renderFormContent()
        )}
      </DialogOrSheetContent>
    </DialogOrSheet>
  );
};
