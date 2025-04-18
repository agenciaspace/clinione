
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import EmailConfirmationMessage from '@/components/auth/EmailConfirmationMessage';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
      await login(email, password);
      navigate('/dashboard');
      toast("Login realizado", {
        description: "Bem-vindo(a) de volta!"
      });
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

  const handleResendConfirmation = async () => {
    try {
      const { error } = await supabase.auth.resend({
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
    return (
      <div className="flex min-h-screen bg-[#FFFAE6] items-center justify-center p-6">
        <EmailConfirmationMessage 
          email={email}
          onResendEmail={handleResendConfirmation}
          onLogin={() => setNeedsEmailConfirmation(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FFFAE6]">
      <div className="flex-1 hidden lg:block bg-[#FFD600] relative">
        <div className="absolute inset-0 flex flex-col justify-center items-center text-black p-12">
          <img 
            src="/lovable-uploads/9dfe598d-8f37-47e7-971b-4690dde9766f.png" 
            alt="Logo" 
            className="h-16 w-auto"
          />
          <p className="text-xl mb-8 max-w-md text-center mt-8">
            Uma plataforma completa para gestão da sua clínica e presença online.
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            <div className="bg-[#FFFAE6]/80 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Agendamentos</h3>
              <p className="text-sm">Gerencie consultas com facilidade</p>
            </div>
            <div className="bg-[#FFFAE6]/80 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Pacientes</h3>
              <p className="text-sm">Mantenha todos os dados organizados</p>
            </div>
            <div className="bg-[#FFFAE6]/80 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Presença Online</h3>
              <p className="text-sm">Site profissional para sua clínica</p>
            </div>
            <div className="bg-[#FFFAE6]/80 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Relatórios</h3>
              <p className="text-sm">Dados para decisões estratégicas</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/9dfe598d-8f37-47e7-971b-4690dde9766f.png" 
                alt="Logo" 
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl">Acesse sua conta</CardTitle>
            <CardDescription className="text-center">
              Digite seu e-mail e senha para entrar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@clinica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link to="/forgot-password" className="text-xs text-[#FFD600] hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#FFD600] hover:bg-[#E6C000] text-black"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm mt-2">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-[#FFD600] hover:underline">
                Crie uma agora
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
