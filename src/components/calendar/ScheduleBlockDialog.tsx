import React, { useState } from 'react';
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogDescription as DialogDescription,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
} from '@/components/ui/responsive-dialog';
import { ScheduleBlockForm } from '@/components/appointments/ScheduleBlockForm';
import { useScheduleBlocks } from '@/hooks/useScheduleBlocks';
import { Doctor, ScheduleBlock, ScheduleBlockFormData } from '@/types';

interface ScheduleBlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clinicId: string;
  doctors: Doctor[];
  selectedDate?: Date;
  selectedDoctorId?: string;
  initialBlock?: ScheduleBlock;
  isEditing?: boolean;
}

export const ScheduleBlockDialog: React.FC<ScheduleBlockDialogProps> = ({
  isOpen,
  onClose,
  clinicId,
  doctors,
  selectedDate,
  selectedDoctorId,
  initialBlock,
  isEditing = false
}) => {
  const { createScheduleBlock, updateScheduleBlock, isCreating, isUpdating } = useScheduleBlocks(clinicId);

  const handleSubmit = async (blockData: ScheduleBlockFormData) => {
    try {
      if (isEditing && initialBlock) {
        await updateScheduleBlock({
          blockId: initialBlock.id,
          blockData
        });
      } else {
        await createScheduleBlock({
          doctorId: selectedDoctorId || blockData.doctor_id,
          blockData
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving schedule block:', error);
    }
  };

  const getDefaultValues = () => {
    if (initialBlock) {
      return {
        title: initialBlock.title,
        description: initialBlock.description || '',
        start_date: new Date(initialBlock.start_datetime),
        start_time: new Date(initialBlock.start_datetime).toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        end_date: new Date(initialBlock.end_datetime),
        end_time: new Date(initialBlock.end_datetime).toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        block_type: initialBlock.block_type,
        is_recurring: initialBlock.is_recurring,
        doctor_id: initialBlock.doctor_id,
      };
    }

    const defaultDate = selectedDate || new Date();
    return {
      title: '',
      description: '',
      start_date: defaultDate,
      start_time: '09:00',
      end_date: defaultDate,
      end_time: '17:00',
      block_type: 'unavailable' as const,
      is_recurring: false,
      doctor_id: selectedDoctorId || '',
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Bloqueio de Agenda' : 'Novo Bloqueio de Agenda'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações do bloqueio de agenda'
              : 'Configure um período de indisponibilidade para um médico'
            }
          </DialogDescription>
        </DialogHeader>
        <ScheduleBlockForm
          doctors={doctors}
          selectedDoctorId={selectedDoctorId}
          initialData={initialBlock}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isCreating || isUpdating}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
};