
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  hasRole: (role: UserRole) => boolean;
  userRoles: UserRole[];
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  resetPassword: async () => {},
  getAccessToken: async () => null,
  hasRole: () => false,
  userRoles: [],
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user roles from the database
  const fetchUserRoles = async (userId: string) => {
    try {
      // First try to get roles from user_roles table
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        
        // If no roles found, try to get from user metadata as fallback
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.role) {
          const fallbackRole = user.user_metadata.role as UserRole;
          setUserRoles([fallbackRole]);
          console.log("Using fallback role from metadata:", [fallbackRole]);
          
          // Try to insert the role into user_roles table for future use
          try {
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({
                user_id: userId,
                role: fallbackRole
              });
            
            if (insertError) {
              console.log("Could not insert fallback role:", insertError.message);
            }
          } catch (err) {
            console.log("Error inserting fallback role:", err);
          }
        }
        return;
      }
      
      // Extract roles from data
      const roles = rolesData?.map(item => item.role as UserRole) || [];
      setUserRoles(roles);
      
      console.log("User roles loaded:", roles);
      
      // If no roles found but user has metadata role, create the role entry
      if (roles.length === 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.role) {
          const metadataRole = user.user_metadata.role as UserRole;
          setUserRoles([metadataRole]);
          console.log("Using role from user metadata:", [metadataRole]);
          
          // Insert role into database for future use (without clinic_id for now)
          try {
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({
                user_id: userId,
                role: metadataRole
              });
            
            if (insertError) {
              console.log("Could not insert role:", insertError.message);
            } else {
              console.log("Role inserted successfully");
            }
          } catch (err) {
            console.log("Error inserting role:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error in fetchUserRoles:", error);
    }
  };

  // Check if user has a specific role
  const hasRole = (role: UserRole) => {
    return userRoles.includes(role);
  };

  // Verificar autenticação quando o componente monta e monitorar alterações
  useEffect(() => {
    // Primeiro definir o listener de mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Evento de autenticação:", event);
        console.log("Sessão:", session);
        
        if (session && session.user) {
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || 'Usuário',
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'patient',
            clinicId: session.user.user_metadata?.clinicId
          };
          
          setUser(userData);
          fetchUserRoles(session.user.id);
          console.log("ID do usuário definido:", session.user.id);
        } else {
          setUser(null);
          setUserRoles([]);
          console.log("Usuário definido como null");
        }
        setIsLoading(false);
      }
    );

    // Em seguida, verificar se já existe uma sessão
    const checkCurrentSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        console.log("Sessão existente encontrada:", session.user.id);
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Usuário',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'patient',
          clinicId: session.user.user_metadata?.clinicId
        };
        
        setUser(userData);
        fetchUserRoles(session.user.id);
      }
      setIsLoading(false);
    };

    checkCurrentSession();

    // Cancelar a inscrição quando o componente for desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função para obter o token de acesso atual
  const getAccessToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error("Erro ao obter token de acesso:", error);
      return null;
    }
  };

  // Login com Supabase
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        const userData = {
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Usuário',
          email: data.user.email || '',
          role: data.user.user_metadata?.role || 'patient',
          clinicId: data.user.user_metadata?.clinicId
        };
        
        setUser(userData);
        fetchUserRoles(data.user.id);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout com Supabase
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRoles([]);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Registro com Supabase
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        const userData = {
          id: data.user.id,
          name: data.user.user_metadata?.name || name,
          email: data.user.email || '',
          role: data.user.user_metadata?.role || role,
          clinicId: data.user.user_metadata?.clinicId
        };
        
        setUser(userData);
        
        // Insert the role into the user_roles table
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: role
          });
          
        if (roleError) {
          console.error("Error setting user role:", roleError);
        } else {
          setUserRoles([role]);
        }
      }
    } catch (error) {
      console.error("Erro ao registrar:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset de senha com Supabase
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Erro ao solicitar reset de senha:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading,
        login,
        logout,
        register,
        resetPassword,
        getAccessToken,
        hasRole,
        userRoles
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
