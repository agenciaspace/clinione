
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
import { Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  const { slots, isLoading } = useAvailableSlots(clinicId, selectedDate);

  // Efeito para pré-selecionar a data atual quando o componente for montado
  useEffect(() => {
    if (open && !selectedDate) {
      const today = new Date();
      setSelectedDate(today);
    }
  }, [open, selectedDate]);

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
      // Converter para Date para garantir formato correto
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
          status: 'scheduled'
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Limpar formulário e mostrar mensagem de sucesso
      setFormData({
        patient_name: '',
        phone: '',
        email: '',
        notes: '',
      });
      
      setIsSuccess(true);
      toast.success('Agendamento realizado com sucesso!');
      
      // Fechar o formulário após um breve delay
      setTimeout(() => {
        setFormOpen(false);
        setOpen(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Erro ao agendar consulta:', error);
      toast.error('Ocorreu um erro ao agendar a consulta. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setFormOpen(false);
    setIsSuccess(false);
  };

  const renderSlots = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando horários disponíveis...</span>
        </div>
      );
    }

    if (!slots || slots.length === 0) {
      return (
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {selectedDate
              ? "Não há horários disponíveis para esta data"
              : "Selecione uma data para ver os horários disponíveis"}
          </p>
        </div>
      );
    }

    // Agrupar horários por médico
    const slotsByDoctor = slots.reduce((acc: any, slot) => {
      if (!acc[slot.doctor_name]) {
        acc[slot.doctor_name] = [];
      }
      acc[slot.doctor_name].push(slot);
      return acc;
    }, {});

    return (
      <div className="space-y-4">
        {Object.entries(slotsByDoctor).map(([doctorName, doctorSlots]: [string, any]) => (
          <div key={doctorName} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Dr(a). {doctorName}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {doctorSlots.map((slot: any) => (
                <Button
                  key={`${slot.doctor_id}-${slot.start_time}`}
                  variant="outline"
                  size="sm"
                  className="justify-center h-9"
                  onClick={() => handleSlotSelect(slot)}
                >
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  <span>{format(new Date(slot.start_time), 'HH:mm')}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetState();
      }}>
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Agendar Consulta
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agendar Consulta</DialogTitle>
            <DialogDescription>
              Selecione uma data e horário disponível para a sua consulta
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 pt-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ptBR}
                  disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                  initialFocus
                  className="rounded-md border"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-3">
                  {selectedDate
                    ? `Horários disponíveis para ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
                    : 'Selecione uma data para ver os horários disponíveis'}
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-auto p-1">
                  {renderSlots()}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isMobile ? (
        <Sheet open={formOpen} onOpenChange={setFormOpen}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>
                {isSuccess 
                  ? 'Agendamento Concluído!'
                  : 'Complete seu agendamento'}
              </SheetTitle>
            </SheetHeader>
            
            {renderFormContent()}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {isSuccess 
                  ? 'Agendamento Concluído!'
                  : 'Complete seu agendamento'}
              </DialogTitle>
            </DialogHeader>
            
            {renderFormContent()}
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  function renderFormContent() {
    return isSuccess ? (
      <div className="mt-6 space-y-4">
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-green-700">Sua consulta foi agendada com sucesso!</p>
          <p className="mt-2 text-sm text-green-600">
            Agendamento com Dr(a). {selectedSlot?.doctor_name} para{' '}
            {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}{' '}
            às {selectedSlot && format(new Date(selectedSlot.start_time), 'HH:mm')}
          </p>
        </div>
        <Button onClick={() => {
          setFormOpen(false);
          setOpen(false);
          resetState();
        }} className="w-full">
          Fechar
        </Button>
      </div>
    ) : (
      <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
        <div className="rounded-md bg-blue-50 p-4 mb-6">
          <p className="text-blue-700">
            Consulta com Dr(a). {selectedSlot?.doctor_name}
          </p>
          <p className="text-sm text-blue-600">
            {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às{' '}
            {selectedSlot && format(new Date(selectedSlot.start_time), 'HH:mm')}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="patient_name">Nome completo</Label>
          <Input
            id="patient_name"
            name="patient_name"
            value={formData.patient_name}
            onChange={handleFormChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleFormChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Input
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleFormChange}
          />
        </div>
        
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirmando...</> : 
              'Confirmar Agendamento'}
          </Button>
        </DialogFooter>
      </form>
    );
  }
};
