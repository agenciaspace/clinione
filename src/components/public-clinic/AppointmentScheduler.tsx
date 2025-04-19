
import React, { useState, ReactNode } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';

interface AppointmentSchedulerProps {
  clinicId: string;
  trigger?: ReactNode;
}

export const AppointmentScheduler = ({ clinicId, trigger }: AppointmentSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [open, setOpen] = useState(false);
  const { slots, isLoading } = useAvailableSlots(clinicId, selectedDate);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        </DialogHeader>
        <div className="grid gap-6 pt-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-3">
                {selectedDate
                  ? `Horários disponíveis para ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
                  : 'Selecione uma data para ver os horários disponíveis'}
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-auto">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando horários...</p>
                ) : slots && slots.length > 0 ? (
                  slots.map((slot) => (
                    <Button
                      key={`${slot.doctor_id}-${slot.start_time}`}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        // TODO: Implementar lógica de confirmação do agendamento
                        console.log('Slot selecionado:', slot);
                      }}
                    >
                      <span>{format(new Date(slot.start_time), 'HH:mm')}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        Dr(a). {slot.doctor_name}
                      </span>
                    </Button>
                  ))
                ) : selectedDate ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum horário disponível para esta data
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
