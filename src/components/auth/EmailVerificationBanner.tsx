import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const EmailVerificationBanner: React.FC = () => {
  const { user, isEmailVerified } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleResendConfirmation = async () => {
    if (!user?.email) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      toast.success('Email de confirmação reenviado!', {
        description: 'Verifique sua caixa de entrada e spam.'
      });
    } catch (error) {
      console.error('Error resending confirmation:', error);
      toast.error('Erro ao reenviar confirmação');
    } finally {
      setIsResending(false);
    }
  };

  const handleRefreshVerification = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      // Force refresh of user data
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing user:', error);
      toast.error('Erro ao verificar confirmação');
    }
  };

  // Don't show banner if user is verified or banner is dismissed
  if (!user || isEmailVerified || isDismissed) {
    return null;
  }

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <strong>Email não confirmado:</strong> Confirme seu email para acessar todas as funcionalidades.
          Enviamos um link para <strong>{user.email}</strong>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            onClick={handleRefreshVerification}
            variant="outline"
            size="sm"
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            Já confirmei
          </Button>
          <Button
            onClick={handleResendConfirmation}
            disabled={isResending}
            variant="outline"
            size="sm"
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            {isResending ? (
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Mail className="h-3 w-3 mr-1" />
            )}
            Reenviar
          </Button>
          <Button
            onClick={() => setIsDismissed(true)}
            variant="ghost"
            size="sm"
            className="text-orange-600 hover:bg-orange-100 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};