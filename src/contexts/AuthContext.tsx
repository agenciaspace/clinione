
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
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  getAccessToken: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação quando o componente monta e monitorar alterações
  useEffect(() => {
    // Primeiro definir o listener de mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Evento de autenticação:", event);
        console.log("Sessão:", session);
        
        if (session && session.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || 'Usuário',
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'user',
            clinicId: session.user.user_metadata?.clinicId
          });
          console.log("ID do usuário definido:", session.user.id);
        } else {
          setUser(null);
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
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Usuário',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'user',
          clinicId: session.user.user_metadata?.clinicId
        });
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
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Usuário',
          email: data.user.email || '',
          role: data.user.user_metadata?.role || 'user',
          clinicId: data.user.user_metadata?.clinicId
        });
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
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || name,
          email: data.user.email || '',
          role: data.user.user_metadata?.role || role,
          clinicId: data.user.user_metadata?.clinicId
        });
      }
    } catch (error) {
      console.error("Erro ao registrar:", error);
      throw error;
    } finally {
      setIsLoading(false);
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
        getAccessToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
