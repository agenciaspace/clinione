import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { ScheduleBlock, ScheduleBlockFormData } from '@/types';

export const useScheduleBlocks = (clinicId?: string, doctorId?: string) => {
  const queryClient = useQueryClient();

  // Fetch schedule blocks
  const { data: scheduleBlocks = [], isLoading } = useQuery({
    queryKey: ['schedule-blocks', clinicId, doctorId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      let query = supabase
        .from('schedule_blocks')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('start_datetime', { ascending: true });

      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching schedule blocks:', error);
        toast.error('Erro ao carregar bloqueios de agenda');
        return [];
      }
      
      return data || [];
    },
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Create schedule block mutation
  const createScheduleBlock = useMutation({
    mutationFn: async ({ doctorId, blockData }: { doctorId: string; blockData: ScheduleBlockFormData }) => {
      if (!clinicId) throw new Error('Clínica não selecionada');

      const { data, error } = await supabase
        .from('schedule_blocks')
        .insert({
          doctor_id: doctorId,
          clinic_id: clinicId,
          title: blockData.title,
          description: blockData.description,
          start_datetime: blockData.start_datetime,
          end_datetime: blockData.end_datetime,
          block_type: blockData.block_type,
          is_recurring: blockData.is_recurring,
          recurrence_pattern: blockData.recurrence_pattern,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating schedule block:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-blocks', clinicId, doctorId] });
      toast.success('Bloqueio de agenda criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating schedule block:', error);
      toast.error('Erro ao criar bloqueio de agenda');
    },
  });

  // Update schedule block mutation
  const updateScheduleBlock = useMutation({
    mutationFn: async ({ blockId, blockData }: { blockId: string; blockData: Partial<ScheduleBlockFormData> }) => {
      const { data, error } = await supabase
        .from('schedule_blocks')
        .update({
          title: blockData.title,
          description: blockData.description,
          start_datetime: blockData.start_datetime,
          end_datetime: blockData.end_datetime,
          block_type: blockData.block_type,
          is_recurring: blockData.is_recurring,
          recurrence_pattern: blockData.recurrence_pattern,
        })
        .eq('id', blockId)
        .select()
        .single();

      if (error) {
        console.error('Error updating schedule block:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-blocks', clinicId, doctorId] });
      toast.success('Bloqueio de agenda atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating schedule block:', error);
      toast.error('Erro ao atualizar bloqueio de agenda');
    },
  });

  // Delete schedule block mutation
  const deleteScheduleBlock = useMutation({
    mutationFn: async (blockId: string) => {
      const { error } = await supabase
        .from('schedule_blocks')
        .delete()
        .eq('id', blockId);

      if (error) {
        console.error('Error deleting schedule block:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-blocks', clinicId, doctorId] });
      toast.success('Bloqueio de agenda removido com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting schedule block:', error);
      toast.error('Erro ao remover bloqueio de agenda');
    },
  });

  // Check if a time slot is blocked
  const isTimeSlotBlocked = (doctorId: string, startTime: string, endTime: string) => {
    const doctorBlocks = scheduleBlocks.filter(block => block.doctor_id === doctorId);
    
    return doctorBlocks.some(block => {
      const blockStart = new Date(block.start_datetime);
      const blockEnd = new Date(block.end_datetime);
      const slotStart = new Date(startTime);
      const slotEnd = new Date(endTime);

      // Check for overlap
      return (
        (slotStart >= blockStart && slotStart < blockEnd) ||
        (slotEnd > blockStart && slotEnd <= blockEnd) ||
        (slotStart <= blockStart && slotEnd >= blockEnd)
      );
    });
  };

  // Get blocks for a specific date range
  const getBlocksForDateRange = (startDate: string, endDate: string, doctorId?: string) => {
    let blocks = scheduleBlocks;
    
    if (doctorId) {
      blocks = blocks.filter(block => block.doctor_id === doctorId);
    }
    
    return blocks.filter(block => {
      const blockStart = new Date(block.start_datetime);
      const blockEnd = new Date(block.end_datetime);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);

      return (
        (blockStart >= rangeStart && blockStart <= rangeEnd) ||
        (blockEnd >= rangeStart && blockEnd <= rangeEnd) ||
        (blockStart <= rangeStart && blockEnd >= rangeEnd)
      );
    });
  };

  return {
    scheduleBlocks,
    isLoading,
    createScheduleBlock: createScheduleBlock.mutate,
    updateScheduleBlock: updateScheduleBlock.mutate,
    deleteScheduleBlock: deleteScheduleBlock.mutate,
    isCreating: createScheduleBlock.isPending,
    isUpdating: updateScheduleBlock.isPending,
    isDeleting: deleteScheduleBlock.isPending,
    isTimeSlotBlocked,
    getBlocksForDateRange,
  };
};