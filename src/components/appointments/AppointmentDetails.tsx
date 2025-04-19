
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';
import { CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export const AppointmentDetails = ({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  onUpdateNotes
}: AppointmentDetailsProps) => {
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    if (appointment) {
      setNotes(appointment.notes || '');
    }
  }, [appointment]);

  if (!appointment) {
    return null;
  }

  const handleSaveNotes = () => {
    onUpdateNotes(appointment.id, notes);
  };

  const appointmentTime = format(new Date(appointment.date), 'HH:mm', { locale: ptBR });
  const appointmentDate = format(new Date(appointment.date), "dd 'de' MMMM", { locale: ptBR });

  const getStatusBadge = () => {
    switch (appointment.status) {
      case 'confirmed':
        return <Badge className="bg-healthgreen-600">Confirmado</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'completed':
        return <Badge className="bg-blue-600">Realizado</Badge>;
      case 'no-show':
        return <Badge variant="outline" className="border-red-300 text-red-500">Não compareceu</Badge>;
      default:
        return <Badge variant="outline">Agendado</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-healthgreen-600" />
            Detalhes do Agendamento
          </DialogTitle>
          <DialogDescription>
            {appointmentTime} - {appointmentDate}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Paciente:</span>
            <span className="text-sm">{appointment.patient_name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Profissional:</span>
            <span className="text-sm">{appointment.doctor_name || 'Não especificado'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tipo:</span>
            <span className="text-sm">{appointment.type === 'online' ? 'Teleconsulta' : 'Presencial'}</span>
          </div>
          
          <div className="space-y-2">
            <span className="text-sm font-medium">Observações:</span>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre este agendamento..."
              className="h-24"
            />
            <Button variant="outline" size="sm" onClick={handleSaveNotes} className="w-full">
              Salvar observações
            </Button>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          {appointment.status !== 'confirmed' && appointment.status !== 'cancelled' && (
            <Button 
              variant="outline"
              className="text-healthgreen-600 border-healthgreen-200 hover:border-healthgreen-600"
              onClick={() => onConfirm(appointment.id)}
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Confirmar
            </Button>
          )}
          
          {appointment.status !== 'cancelled' && (
            <Button 
              variant="outline"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => onCancel(appointment.id)}
              size="sm"
            >
              <XCircle className="h-4 w-4 mr-1" /> Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
