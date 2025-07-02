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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';
import { useDeleteAppointment } from '@/hooks/mutations/appointments/useDeleteAppointment';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar, Clock, User, Stethoscope, FileText, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const { deleteAppointment, isDeleting } = useDeleteAppointment();
  const isMobile = useIsMobile();
  
  const handleDelete = () => {
    if (appointment) {
      onDelete(appointment.id);
    }
  };

  if (!appointment) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'in-person': return 'Presencial';
      case 'online': return 'Teleconsulta';
      default: return type;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh] overflow-y-auto' : 'max-w-md'}`}>
        <AlertDialogHeader className="pb-4">
          <AlertDialogTitle className="text-lg sm:text-xl flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Detalhes do Agendamento
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Informações completas sobre a consulta
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          {/* Patient Info */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Paciente</span>
              </div>
              <p className="font-semibold text-base">{appointment.patient_name}</p>
            </CardContent>
          </Card>

          {/* Date and Time */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-3'}`}>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Data</span>
                </div>
                <p className="font-medium text-sm">{formatDate(appointment.date)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Horário</span>
                </div>
                <p className="font-medium text-sm">{formatTime(appointment.date)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Status and Type */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-3'}`}>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </div>
                <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                  {getStatusText(appointment.status)}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Tipo</span>
                </div>
                <p className="font-medium text-sm">{getTypeText(appointment.type)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Doctor */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Profissional</span>
              </div>
              <p className="font-medium text-sm">{appointment.doctor_name || 'Não especificado'}</p>
            </CardContent>
          </Card>

          {/* Notes */}
          {appointment.notes && (
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Observações</span>
                </div>
                <p className="text-sm text-muted-foreground">{appointment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <AlertDialogFooter className={`${isMobile ? 'flex-col gap-2 pt-4' : 'flex-row gap-2 pt-4'}`}>
          <AlertDialogCancel className={`${isMobile ? 'w-full order-2' : 'w-auto'}`}>
            Fechar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`${isMobile ? 'w-full order-1' : 'w-auto'}`}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
