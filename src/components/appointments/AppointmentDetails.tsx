import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types';
import { useDeleteAppointment } from '@/hooks/mutations/appointments/useDeleteAppointment';

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function AppointmentDetails({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  onDelete,
  onUpdateNotes
}: AppointmentDetailsProps) {
  const { isDeleting } = useDeleteAppointment();
  
  const handleDelete = () => {
    if (appointment) {
      onDelete(appointment.id);
    }
  };

  if (!appointment) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Detalhes do Agendamento</AlertDialogTitle>
          <AlertDialogDescription>
            Paciente: {appointment.patient_name}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <p><strong>Data:</strong> {appointment.date}</p>
          <p><strong>Horário:</strong> {appointment.time}</p>
          <p><strong>Tipo:</strong> {appointment.type}</p>
          <p><strong>Status:</strong> {appointment.status}</p>
          <p><strong>Médico:</strong> {appointment.doctor_name || 'Nenhum'}</p>
          <p><strong>Observações:</strong> {appointment.notes || 'Nenhuma'}</p>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>Fechar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
