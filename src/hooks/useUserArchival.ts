import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface ArchivalResult {
  success: boolean;
  archived_records: number;
  user_id: string;
  clinic_id: string;
  archival_reason: string;
  legal_retention_until: string;
}

interface ArchivedMedicalData {
  id: string;
  original_table: string;
  original_id: string;
  archived_user_data: any;
  medical_data: any;
  related_entities: any;
  archival_reason: string;
  archived_at: string;
  legal_retention_until: string;
}

export const useUserArchival = () => {
  const [isArchiving, setIsArchiving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Archive user and all their medical data
  const archiveUser = async (
    userId: string, 
    clinicId: string, 
    reason: string = 'Remoção de usuário do sistema'
  ): Promise<ArchivalResult | null> => {
    setIsArchiving(true);
    
    try {
      // Call the archive function
      const { data, error } = await supabase.rpc('archive_user_medical_data', {
        target_user_id: userId,
        target_clinic_id: clinicId,
        archival_reason: reason
      });

      if (error) {
        throw error;
      }

      toast.success(
        `Usuário arquivado com sucesso. ${data.archived_records} registros médicos preservados por 5 anos.`,
        { duration: 5000 }
      );

      return data as ArchivalResult;
    } catch (error) {
      console.error('Error archiving user:', error);
      toast.error('Erro ao arquivar usuário e dados médicos');
      return null;
    } finally {
      setIsArchiving(false);
    }
  };

  // Get archived medical data for a clinic
  const getArchivedMedicalData = async (clinicId: string): Promise<ArchivedMedicalData[]> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('archived_medical_data')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('archived_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching archived medical data:', error);
      toast.error('Erro ao carregar dados médicos arquivados');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Check if archived data can be permanently deleted (after 5 years)
  const canDeleteArchivedData = async (archivedDataId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('can_delete_archived_data', {
        archived_data_id: archivedDataId
      });

      if (error) {
        throw error;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking deletion eligibility:', error);
      return false;
    }
  };

  // Delete expired archived data (after 5+ years)
  const deleteExpiredArchivedData = async (): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('delete_expired_archived_data');

      if (error) {
        throw error;
      }

      const deletedCount = data || 0;
      
      if (deletedCount > 0) {
        toast.success(`${deletedCount} registros arquivados foram permanentemente removidos após período legal de retenção.`);
      }

      return deletedCount;
    } catch (error) {
      console.error('Error deleting expired archived data:', error);
      toast.error('Erro ao remover dados arquivados expirados');
      return 0;
    }
  };

  // Get archived users for a clinic
  const getArchivedUsers = async (clinicId: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          original_user_data
        `)
        .eq('clinic_id', clinicId)
        .eq('is_archived', true)
        .order('archived_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching archived users:', error);
      toast.error('Erro ao carregar usuários arquivados');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Restore user (unarchive) - only if medical data hasn't been permanently deleted
  const restoreUser = async (userId: string, clinicId: string): Promise<boolean> => {
    try {
      // Restore user role
      const { error: userError } = await supabase
        .from('user_roles')
        .update({
          is_archived: false,
          archived_at: null,
          archived_by: null,
          archival_reason: null
        })
        .eq('user_id', userId)
        .eq('clinic_id', clinicId);

      if (userError) throw userError;

      // Restore doctor profile if exists
      const { error: doctorError } = await supabase
        .from('doctors')
        .update({
          is_archived: false,
          archived_at: null,
          archived_by: null
        })
        .eq('user_id', userId)
        .eq('clinic_id', clinicId);

      // Don't throw error if doctor doesn't exist
      if (doctorError && !doctorError.message.includes('No rows')) {
        console.warn('Error restoring doctor profile:', doctorError);
      }

      // Restore appointments
      const { error: appointmentsError } = await supabase
        .from('appointments')
        .update({
          is_archived: false,
          archived_at: null,
          archived_by: null
        })
        .eq('doctor_id', userId)
        .eq('clinic_id', clinicId);

      if (appointmentsError) {
        console.warn('Error restoring appointments:', appointmentsError);
      }

      // Restore patient records
      const { error: recordsError } = await supabase
        .from('patient_records')
        .update({
          is_archived: false,
          archived_at: null,
          archived_by: null
        })
        .eq('created_by', userId)
        .eq('clinic_id', clinicId);

      if (recordsError) {
        console.warn('Error restoring patient records:', recordsError);
      }

      toast.success('Usuário restaurado com sucesso');
      return true;
    } catch (error) {
      console.error('Error restoring user:', error);
      toast.error('Erro ao restaurar usuário');
      return false;
    }
  };

  return {
    archiveUser,
    getArchivedMedicalData,
    canDeleteArchivedData,
    deleteExpiredArchivedData,
    getArchivedUsers,
    restoreUser,
    isArchiving,
    isLoading
  };
};