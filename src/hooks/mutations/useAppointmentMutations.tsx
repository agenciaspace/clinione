
import { useCreateAppointmentSimple } from './appointments/useCreateAppointmentSimple';
import { useAppointmentStatusMutations } from './appointments/useStatusMutations';
import { useAppointmentNotes } from './appointments/useAppointmentNotes';
import { useDeleteAppointment } from './appointments/useDeleteAppointment';

export const useAppointmentMutations = (clinicId: string | undefined) => {
  const { deleteAppointment } = useDeleteAppointment();
  const { updateAppointmentNotes } = useAppointmentNotes();
  const { confirmAppointment, cancelAppointment } = useAppointmentStatusMutations(clinicId);
  const createAppointment = useCreateAppointmentSimple(clinicId);

  return {
    createAppointment: createAppointment.mutate,
    confirmAppointment,
    cancelAppointment,
    deleteAppointment,
    updateAppointmentNotes,
  };
};
