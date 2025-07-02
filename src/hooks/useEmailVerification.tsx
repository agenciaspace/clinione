import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useEmailVerification = () => {
  const { user, isEmailVerified } = useAuth();

  const requireEmailVerification = async (action: string = 'esta ação'): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    // Check current verification status
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.email_confirmed_at) {
      toast.error('Email não confirmado', {
        description: `Você precisa confirmar seu email antes de ${action}.`
      });
      return false;
    }

    return true;
  };

  const checkEmailVerificationStatus = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      return !!currentUser?.email_confirmed_at;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  };

  return {
    isEmailVerified,
    requireEmailVerification,
    checkEmailVerificationStatus
  };
};