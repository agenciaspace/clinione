import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

export const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({ children }) => {
  const { user, isLoading, isEmailVerified } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<Date | null>(null);

  const handleResendConfirmation = async () => {
    if (!user?.email) return;

    // Limit resends to prevent spam
    if (resendCount >= 3) {
      toast.error('Limite de reenvios atingido', {
        description: 'Aguarde alguns minutos antes de tentar novamente.'
      });
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      setResendCount(prev => prev + 1);
      setLastResendTime(new Date());
      
      toast.success('Email de confirmação reenviado!', {
        description: 'Verifique sua caixa de entrada e spam.'
      });
    } catch (error: any) {
      console.error('Error resending confirmation:', error);
      if (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('Email rate limit exceeded')) {
        toast.error('Limite de envio atingido', {
          description: 'Muitos emails foram enviados. Aguarde alguns minutos antes de tentar novamente.'
        });
      } else {
        toast.error('Erro ao reenviar confirmação', {
          description: 'Tente novamente em alguns minutos.'
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Show verification required if user exists but email is not confirmed
  if (user && !isEmailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Confirme seu email</CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para <strong>{user.email}</strong>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você precisa confirmar seu email antes de usar a plataforma. 
                Verifique sua caixa de entrada e pasta de spam.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={handleRefreshVerification}
                className="w-full"
                variant="default"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Já confirmei meu email
              </Button>

              <Button
                onClick={handleResendConfirmation}
                disabled={isResending || resendCount >= 3}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {resendCount >= 3 ? 'Limite atingido' : 'Reenviar confirmação'}
              </Button>

              {lastResendTime && (
                <p className="text-sm text-gray-500 text-center">
                  Último envio: {lastResendTime.toLocaleTimeString()}
                </p>
              )}

              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full text-gray-500"
              >
                Usar outro email
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-2">Não recebeu o email?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Verifique a pasta de spam/lixo eletrônico</li>
                <li>• Aguarde alguns minutos (pode demorar)</li>
                <li>• Certifique-se de que o email está correto</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is verified, render children
  return <>{children}</>;
};