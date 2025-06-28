import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Erro de validação", {
        description: "Por favor, digite seu e-mail"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast.success("E-mail enviado", {
        description: "Verifique sua caixa de entrada para o link de redefinição de senha."
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error("Erro ao enviar e-mail", {
        description: error.message || "Ocorreu um erro ao enviar o e-mail de redefinição."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFAE6] p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-xl">E-mail enviado!</CardTitle>
            <CardDescription>
              Enviamos um link de redefinição de senha para{' '}
              <span className="font-semibold">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha. 
                O link expira em 1 hora.
              </p>
            </div>
            <p className="text-gray-500 text-sm">
              Não encontrou o e-mail? Verifique sua pasta de spam.
            </p>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para o login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFAE6] p-6">
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
            Digite seu e-mail e enviaremos um link para redefinir sua senha
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
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-[#FFD600] hover:underline">
              Lembrou da senha? Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword; 