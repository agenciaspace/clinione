
import { UserRole } from '@/types';

export const isAdmin = (roles: UserRole[]): boolean => {
  return roles.includes('admin');
};

export const isDoctor = (roles: UserRole[]): boolean => {
  return roles.includes('doctor');
};

export const isReceptionist = (roles: UserRole[]): boolean => {
  return roles.includes('receptionist');
};

export const isPatient = (roles: UserRole[]): boolean => {
  return roles.includes('patient');
};

export const isOwner = (roles: UserRole[]): boolean => {
  return roles.includes('owner');
};

export const isStaff = (roles: UserRole[]): boolean => {
  return roles.includes('staff');
};

export const isSuperAdmin = (roles: UserRole[]): boolean => {
  return roles.includes('super_admin');
};

// Function to add a user role
export const addUserRole = async (supabase: any, userId: string, role: UserRole): Promise<void> => {
  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: role
    });
    
  if (error) {
    throw new Error(`Failed to add role: ${error.message}`);
  }
};

// Function to remove a user role
export const removeUserRole = async (supabase: any, userId: string, role: UserRole): Promise<void> => {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .match({
      user_id: userId,
      role: role
    });
    
  if (error) {
    throw new Error(`Failed to remove role: ${error.message}`);
  }
};

// Function to get user roles
export const getUserRoles = async (supabase: any, userId: string): Promise<UserRole[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
    
  if (error) {
    throw new Error(`Failed to get roles: ${error.message}`);
  }
    
  return data.map((item: any) => item.role);
};
