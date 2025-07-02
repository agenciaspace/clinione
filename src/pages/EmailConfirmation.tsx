import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EmailConfirmation: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    // Check if this is a confirmation callback from email
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    if (token && type === 'signup') {
      handleEmailConfirmation(token);
    }
  }, [searchParams]);

  const handleEmailConfirmation = async (token: string) => {
    setIsConfirming(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });

      if (error) throw error;

      if (data.user) {
        setConfirmationStatus('success');
        toast.success('Email confirmado com sucesso!', {
          description: 'Você pode agora acessar todas as funcionalidades.'
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error confirming email:', error);
      setConfirmationStatus('error');
      toast.error('Erro ao confirmar email', {
        description: 'O link pode ter expirado. Tente solicitar um novo.'
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!user?.email) return;

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
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (isConfirming) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Confirmando seu email...</h2>
            <p className="text-gray-600">Aguarde enquanto verificamos sua confirmação.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmationStatus === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Email confirmado!</CardTitle>
            <CardDescription>
              Seu email foi confirmado com sucesso. Redirecionando...
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <Button onClick={handleGoToDashboard} className="w-full">
              Ir para o Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmationStatus === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Erro na confirmação</CardTitle>
            <CardDescription>
              Não foi possível confirmar seu email. O link pode ter expirado.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                O link de confirmação pode ter expirado ou já foi usado.
                Solicite um novo link de confirmação.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button onClick={handleResendConfirmation} className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Solicitar novo link
              </Button>

              <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                Voltar ao login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default confirmation pending view
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">Aguardando confirmação</CardTitle>
          <CardDescription>
            Verifique seu email para confirmar sua conta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Enviamos um link de confirmação para seu email. 
              Clique no link para ativar sua conta.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button onClick={handleResendConfirmation} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reenviar email de confirmação
            </Button>

            <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
              Voltar ao login
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
};

export default EmailConfirmation;