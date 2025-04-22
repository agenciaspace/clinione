
import { useCreateAppointment } from './appointments/useCreateAppointment';
import { useAppointmentStatusMutations } from './appointments/useStatusMutations';
import { useAppointmentNotes } from './appointments/useAppointmentNotes';
import { useDeleteAppointment } from './appointments/useDeleteAppointment';

export const useAppointmentMutations = (clinicId: string | undefined) => {
  const { deleteAppointment } = useDeleteAppointment();
  const { updateAppointmentNotes } = useAppointmentNotes();
  const { confirmAppointment, cancelAppointment } = useAppointmentStatusMutations(clinicId);
  const createAppointment = useCreateAppointment(clinicId);

  return {
    createAppointment: createAppointment.mutate,
    confirmAppointment,
    cancelAppointment,
    deleteAppointment,
    updateAppointmentNotes,
  };
};
