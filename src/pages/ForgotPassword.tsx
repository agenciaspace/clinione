import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Erro de validação", {
        description: "Por favor, digite seu e-mail"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast.success("E-mail enviado", {
        description: "Verifique sua caixa de entrada para o link de recuperação"
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error("Erro ao enviar e-mail", {
        description: "Verifique se o e-mail está correto e tente novamente"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen bg-[#FFFAE6] items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">E-mail enviado!</CardTitle>
            <CardDescription className="text-center">
              Enviamos um link de recuperação para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Verifique sua caixa de entrada e clique no link para redefinir sua senha. 
              O link expira em 1 hora.
            </p>
            <p className="text-xs text-gray-500 text-center">
              Não recebeu o e-mail? Verifique sua pasta de spam ou tente novamente.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setEmailSent(false)}
            >
              Tentar outro e-mail
            </Button>
            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FFFAE6]">
      <div className="flex-1 hidden lg:block bg-[#FFD600] relative">
        <div className="absolute inset-0 flex flex-col justify-center items-center text-black p-12">
          <h1 className="text-4xl font-bold mb-4">Recuperar Senha</h1>
          <p className="text-xl mb-8 max-w-md text-center">
            Não se preocupe! Digite seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
          <div className="grid grid-cols-1 gap-4 w-full max-w-lg">
            <div className="bg-[#FFFAE6]/80 p-6 rounded-lg text-center">
              <Mail className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Processo Seguro</h3>
              <p className="text-sm">
                Enviamos um link seguro para seu e-mail que expira em 1 hora
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/1424b683-055d-4b5c-bccc-84cd26273e7a.png" 
                alt="Clini.One Logo" 
                className="h-16 w-auto min-h-[130px] min-w-[400px] max-w-[250px] aspect-[4/1] object-scale-down" 
              />
            </div>
            <CardTitle className="text-2xl">Esqueceu sua senha?</CardTitle>
            <CardDescription className="text-center">
              Digite seu e-mail para receber um link de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@clinica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#FFD600] hover:bg-[#E6C000] text-black" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm">
              Lembrou da senha?{" "}
              <Link to="/login" className="text-[#FFD600] hover:underline">
                Fazer login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword; 