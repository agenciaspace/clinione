import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useTabSyncAuth } from '@/hooks/useTabSyncAuth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ requiresMFA?: boolean }>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  hasRole: (role: UserRole) => boolean;
  userRoles: UserRole[];
  completeMFALogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isEmailVerified: false,
  isLoading: true,
  login: async () => ({}),
  logout: () => {},
  register: async () => {},
  resetPassword: async () => {},
  getAccessToken: async () => null,
  hasRole: () => false,
  userRoles: [],
  completeMFALogin: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const sessionRef = useRef<{ lastFocusCheck?: number }>({});

  const isLoading = isLoadingAuth || rolesLoading;

  // Fetch user roles from the database
  const fetchUserRoles = useCallback(async (userId: string) => {
    setRolesLoading(true);
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
        setRolesLoading(false);
        return;
      }
      
      // Extract roles from data
      const roles = rolesData?.map(item => item.role as UserRole) || [];
      setUserRoles(roles);
      
      if (import.meta.env.DEV) {
        console.log("User roles loaded:", roles);
      }
      
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
        setRolesLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error in fetchUserRoles:", error);
    } finally {
      setRolesLoading(false);
    }
  }, []); // No dependencies needed since it only uses setState functions

  // Check if user has a specific role
  const hasRole = (role: UserRole) => {
    return userRoles.includes(role);
  };

  // Handlers for cross-tab communication
  const handleTabLogin = useCallback((userData: User) => {
    setUser(userData);
    setIsEmailVerified(true);
    fetchUserRoles(userData.id);
  }, [fetchUserRoles]);

  const handleTabLogout = useCallback(() => {
    setUser(null);
    setUserRoles([]);
    setIsEmailVerified(false);
    setRolesLoading(false);
  }, []);

  // Use the tab sync hook
  const { broadcastLogin, broadcastLogout } = useTabSyncAuth({
    onLogin: handleTabLogin,
    onLogout: handleTabLogout,
    currentUser: user,
  });

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
          setIsEmailVerified(!!session.user.email_confirmed_at);
          fetchUserRoles(session.user.id);
          
          // Broadcast login event to other tabs
          broadcastLogin(userData);
          
          console.log("ID do usuário definido:", session.user.id);
          console.log("Email verificado:", !!session.user.email_confirmed_at);
        } else {
          setUser(null);
          setUserRoles([]);
          setIsEmailVerified(false);
          setRolesLoading(false);
          
          // Broadcast logout event to other tabs
          broadcastLogout();
          
          console.log("Usuário definido como null");
        }
        setIsLoadingAuth(false);
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
        setIsEmailVerified(!!session.user.email_confirmed_at);
        fetchUserRoles(session.user.id);
      } else {
        setRolesLoading(false);
      }
      setIsLoadingAuth(false);
    };

    // Cross-tab communication is now handled by useTabSyncAuth hook

    // Also check session when user returns to tab
    const handleFocus = async () => {
      // Only check session if we don't have a user and it's been more than 5 seconds since last check
      const now = Date.now();
      const lastCheck = sessionRef.current?.lastFocusCheck || 0;
      
      if (!user && (now - lastCheck) > 10000) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          // Update last check time
          if (sessionRef.current) {
            sessionRef.current.lastFocusCheck = now;
          }
          
          // If we don't have a user but there's a session, login
          if (session?.user) {
            console.log("Sessão válida detectada no focus, fazendo login...");
            const userData = {
              id: session.user.id,
              name: session.user.user_metadata?.name || 'Usuário',
              email: session.user.email || '',
              role: session.user.user_metadata?.role || 'patient',
              clinicId: session.user.user_metadata?.clinicId
            };
            
            setUser(userData);
            setIsEmailVerified(!!session.user.email_confirmed_at);
            fetchUserRoles(session.user.id);
          }
        } catch (error) {
          console.error("Erro ao verificar sessão no focus:", error);
        }
      }
    };

    // Add focus listener for session validation
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
    }

    checkCurrentSession();

    // Periodic session validation (every 30 seconds)
    const sessionCheckInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // If we think we have a user but there's no session, logout
        if (user && !session) {
          console.log("Sessão expirada detectada, fazendo logout...");
          setUser(null);
          setUserRoles([]);
          setIsEmailVerified(false);
          setRolesLoading(false);
          
          // Broadcast logout event to other tabs
          broadcastLogout();
        }
        
        // If we don't have a user but there's a session, login
        if (!user && session?.user) {
          console.log("Sessão válida detectada, fazendo login...");
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || 'Usuário',
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'patient',
            clinicId: session.user.user_metadata?.clinicId
          };
          
          setUser(userData);
          setIsEmailVerified(!!session.user.email_confirmed_at);
          fetchUserRoles(session.user.id);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    }, 300000); // Check every 5 minutes

    // Cancelar a inscrição quando o componente for desmontado
    return () => {
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, []); // Remove dependencies to prevent infinite loops - functions are stable

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
    setIsLoadingAuth(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // Verificar se 2FA é necessário
      if (data.user && data.session) {
        // Verificar se o usuário tem MFA configurado
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const hasMFA = factors?.totp && factors.totp.length > 0;
        
        if (hasMFA) {
          // Se tem MFA mas a sessão não está totalmente autenticada, precisa de verificação
          // Supabase retorna aal1 para primeira autenticação e aal2 para MFA completa
          const sessionData = data.session as any;
          if (sessionData.aal !== 'aal2') {
            setIsLoadingAuth(false);
            return { requiresMFA: true };
          }
        }
        
        // Login completo - configurar usuário
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
      
      return {};
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      
      // Handle specific authentication errors
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Credenciais inválidas. Verifique seu email e senha.');
      } else if (error.message?.includes('Email not confirmed')) {
        throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
      } else if (error.message?.includes('Too many requests')) {
        throw new Error('Muitas tentativas de login. Tente novamente em alguns minutos.');
      } else if (error.message?.includes('Invalid email')) {
        throw new Error('Email inválido. Verifique se o email está correto.');
      } else if (error.message?.includes('Signups not allowed')) {
        throw new Error('Login não permitido. Entre em contato com o suporte.');
      }
      
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Completar login após verificação MFA
  const completeMFALogin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
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
      }
    } catch (error) {
      console.error("Erro ao completar login MFA:", error);
      throw error;
    }
  };

  // Logout com Supabase
  const logout = async () => {
    try {
      // Clear auth state immediately to prevent UI flickering
      setUser(null);
      setUserRoles([]);
      setIsEmailVerified(false);
      setRolesLoading(false);
      
      // Broadcast logout event to all tabs immediately
      broadcastLogout();
      
      // Sign out from Supabase (this will trigger the auth state change)
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Even if logout fails, clear local state
      setUser(null);
      setUserRoles([]);
      setIsEmailVerified(false);
      setRolesLoading(false);
      // Still broadcast logout to other tabs
      broadcastLogout();
    }
  };

  // Registro com Supabase
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoadingAuth(true);
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
        setRolesLoading(false);
      }
    } catch (error: any) {
      console.error("Erro ao registrar:", error);
      
      // Handle rate limiting errors specifically
      if (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
        throw new Error('Muitas tentativas de registro. Aguarde alguns minutos antes de tentar novamente.');
      } else if (error.message?.includes('rate_limit_exceeded')) {
        throw new Error('Limite de tentativas excedido. Tente novamente em alguns minutos.');
      } else if (error.message?.includes('Email rate limit exceeded')) {
        throw new Error('Muitos emails de confirmação enviados. Aguarde antes de tentar novamente.');
      } else if (error.message?.includes('email rate limit exceeded')) {
        throw new Error('Limite de envio de emails atingido. Aguarde alguns minutos antes de tentar novamente.');
      } else if (error.message?.includes('User already registered')) {
        throw new Error('Este email já está registrado. Tente fazer login ou use outro email.');
      } else if (error.message?.includes('Password should be at least 6 characters')) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      } else if (error.message?.includes('Invalid email')) {
        throw new Error('Email inválido. Verifique se o email está correto.');
      } else if (error.message?.includes('Signup is disabled')) {
        throw new Error('Registro de novos usuários está temporariamente desabilitado.');
      }
      
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Reset de senha com Supabase
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Erro ao solicitar reset de senha:", error);
      throw error;
    }
  };

  // Permitir override de função de papéis em ambiente de desenvolvimento
  const devRoleOverride = (typeof window !== 'undefined' && window.localStorage.getItem('devRoleOverride')) as UserRole | null;
  const effectiveRoles = devRoleOverride ? [devRoleOverride] : userRoles;

  const hasRoleWithOverride = (role: UserRole) => {
    // Se houver override e for admin, sempre true
    if (devRoleOverride === 'admin') {
      return true;
    }
    if (devRoleOverride) {
      return devRoleOverride === role;
    }
    // Se usuário é admin, também tem acesso total
    if (userRoles.includes('admin')) {
      return true;
    }
    return userRoles.includes(role);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isEmailVerified,
        isLoading,
        login,
        logout,
        register,
        resetPassword,
        getAccessToken,
        hasRole: hasRoleWithOverride,
        userRoles: effectiveRoles,
        completeMFALogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
