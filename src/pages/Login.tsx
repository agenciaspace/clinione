import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import EmailConfirmationMessage from '@/components/auth/EmailConfirmationMessage';
import { TwoFactorVerification } from '@/components/auth/TwoFactorVerification';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [needsMFA, setNeedsMFA] = useState(false);
  const {
    login,
    completeMFALogin
  } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Erro de validação", {
        description: "Por favor, preencha todos os campos"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      
      if (result.requiresMFA) {
        setNeedsMFA(true);
      } else {
        navigate('/dashboard');
        toast("Login realizado", {
          description: "Bem-vindo(a) de volta!"
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'email_not_confirmed' || error.message?.includes('Email not confirmed')) {
        setNeedsEmailConfirmation(true);
      } else {
        toast("Erro de login", {
          description: "Verifique suas credenciais e tente novamente"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMFAVerificationComplete = async () => {
    try {
      await completeMFALogin();
      setNeedsMFA(false);
      navigate('/dashboard');
      toast("Login realizado", {
        description: "Autenticação de dois fatores concluída com sucesso!"
      });
    } catch (error: any) {
      console.error('MFA completion error:', error);
      toast("Erro na autenticação", {
        description: "Ocorreu um erro ao completar o login. Tente novamente."
      });
    }
  };

  const handleMFACancel = () => {
    setNeedsMFA(false);
    setEmail('');
    setPassword('');
  };

  const handleResendConfirmation = async () => {
    try {
      const {
        error
      } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      if (error) {
        throw error;
      }
      toast.success("E-mail reenviado", {
        description: "Verifique sua caixa de entrada para o link de confirmação."
      });
    } catch (error: any) {
      console.error('Error resending confirmation:', error);
      toast.error("Erro ao reenviar e-mail", {
        description: error.message || "Ocorreu um erro ao reenviar o e-mail de confirmação."
      });
    }
  };

  if (needsEmailConfirmation) {
    return <div className="flex min-h-screen bg-[#FFFAE6] items-center justify-center p-4 sm:p-6">
        <EmailConfirmationMessage email={email} onResendEmail={handleResendConfirmation} onLogin={() => setNeedsEmailConfirmation(false)} />
      </div>;
  }

  if (needsMFA) {
    return <div className="flex min-h-screen bg-[#FFFAE6] items-center justify-center p-4 sm:p-6">
        <TwoFactorVerification 
          onVerificationComplete={handleMFAVerificationComplete}
          onCancel={handleMFACancel}
        />
      </div>;
  }

  return <div className="flex min-h-screen bg-[#FFFAE6]">
      {/* Left side - Features (hidden on mobile) */}
      <div className="flex-1 hidden lg:flex bg-[#FFD600] relative">
        <div className="absolute inset-0 flex flex-col justify-center items-center text-black p-8 xl:p-12">
          <p className="text-lg xl:text-xl mb-6 xl:mb-8 max-w-md text-center">
            Uma plataforma completa para gestão da sua clínica e presença online.
          </p>
          <div className="grid grid-cols-2 gap-3 xl:gap-4 w-full max-w-lg">
            <div className="bg-[#FFFAE6]/80 p-3 xl:p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm xl:text-base">Agendamentos</h3>
              <p className="text-xs xl:text-sm">Gerencie consultas com facilidade</p>
            </div>
            <div className="bg-[#FFFAE6]/80 p-3 xl:p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm xl:text-base">Pacientes</h3>
              <p className="text-xs xl:text-sm">Mantenha todos os dados organizados</p>
            </div>
            <div className="bg-[#FFFAE6]/80 p-3 xl:p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm xl:text-base">Presença Online</h3>
              <p className="text-xs xl:text-sm">Site profissional para sua clínica</p>
            </div>
            <div className="bg-[#FFFAE6]/80 p-3 xl:p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm xl:text-base">Relatórios</h3>
              <p className="text-xs xl:text-sm">Dados para decisões estratégicas</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/1424b683-055d-4b5c-bccc-84cd26273e7a.png" 
                alt="Clini.One Logo" 
                className={`h-auto w-auto ${
                  isMobile 
                    ? 'max-h-[80px] max-w-[200px]' 
                    : 'max-h-[100px] max-w-[300px]'
                } object-contain`}
              />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Acesse sua conta</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Digite seu e-mail e senha para entrar
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="exemplo@clinica.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Senha</Label>
                  <Link to="/forgot-password" className="text-xs text-[#FFD600] hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="h-10"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#FFD600] hover:bg-[#E6C000] text-black h-10" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col px-4 sm:px-6">
            <div className="text-center text-sm mt-2">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-[#FFD600] hover:underline">
                Crie uma agora
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>;
};

export default Login;