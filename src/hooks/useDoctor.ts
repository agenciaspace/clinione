import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { Doctor } from '@/types';

interface UseDoctorReturn {
  currentDoctor: Doctor | null;
  isLoadingDoctor: boolean;
  isDoctorRole: boolean;
  isOwnerRole: boolean;
  isSuperAdminRole: boolean;
  canCreateRecords: boolean;
  canEditRecord: (createdBy: string) => boolean;
  canViewAllRecords: boolean;
  canSelectAnyDoctor: boolean;
  error: string | null;
}

export const useDoctor = (): UseDoctorReturn => {
  const { user, hasRole, userRoles } = useAuth();
  const { activeClinic } = useClinic();
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDoctorRole = hasRole('doctor');
  const isOwnerRole = hasRole('owner');
  const isAdminRole = hasRole('admin');
  const isStaffRole = hasRole('staff');
  const isSuperAdminRole = hasRole('super_admin'); // Add super_admin support


  // Permissions based on role - Owners and super_admin have full access
  const canCreateRecords = isDoctorRole || isOwnerRole || isAdminRole || isStaffRole || isSuperAdminRole;
  const canViewAllRecords = isOwnerRole || isAdminRole || isStaffRole || isSuperAdminRole;
  const canSelectAnyDoctor = isOwnerRole || isAdminRole || isStaffRole || isSuperAdminRole;
  const canEditRecord = (createdBy: string) => {
    if (isOwnerRole || isAdminRole || isStaffRole || isSuperAdminRole) return true;
    if (isDoctorRole && user) return createdBy === user.id;
    return false;
  };

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      if (!user || !activeClinic) {
        setCurrentDoctor(null);
        setError(null);
        return;
      }

      // Owners, super_admin don't need to be associated with a specific doctor
      if (isOwnerRole || isAdminRole || isStaffRole || isSuperAdminRole) {
        setCurrentDoctor(null);
        setError(null);
        return;
      }

      // Only fetch doctor info for actual doctor role
      if (!isDoctorRole) {
        setCurrentDoctor(null);
        setError(null);
        return;
      }

      setIsLoadingDoctor(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', user.id)
          .eq('clinic_id', activeClinic.id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No doctor record found for this user
            setError('Usuário não está associado a nenhum médico nesta clínica');
            setCurrentDoctor(null);
          } else {
            console.error('Error fetching doctor info:', fetchError);
            setError('Erro ao carregar informações do médico');
            setCurrentDoctor(null);
          }
          return;
        }

        setCurrentDoctor(data);
      } catch (err) {
        console.error('Error in fetchDoctorInfo:', err);
        setError('Erro inesperado ao carregar informações do médico');
        setCurrentDoctor(null);
      } finally {
        setIsLoadingDoctor(false);
      }
    };

    fetchDoctorInfo();
  }, [user, activeClinic, isDoctorRole, isOwnerRole, isAdminRole, isStaffRole, isSuperAdminRole]);

  return {
    currentDoctor,
    isLoadingDoctor,
    isDoctorRole,
    isOwnerRole,
    isSuperAdminRole,
    canCreateRecords,
    canEditRecord,
    canViewAllRecords,
    canSelectAnyDoctor,
    error
  };
};