import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { CheckCircle, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      console.log('Reset password params:', { accessToken, refreshToken, type });

      if (!accessToken || type !== 'recovery') {
        console.log('Invalid params - missing token or wrong type');
        setIsValidToken(false);
        setIsVerifying(false);
        return;
      }

      try {
        // Primeiro, tenta verificar se o token é válido fazendo uma chamada de teste
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          
          // Se falhar com setSession, pode ser um token de formato diferente
          // Vamos tentar uma abordagem alternativa - verificar se conseguimos fazer update
          try {
            // Tenta fazer um update de teste para verificar se o token é válido
            const { error: testError } = await supabase.auth.updateUser({});
            
            if (testError && testError.message.includes('Invalid token')) {
              console.error('Token is invalid');
              setIsValidToken(false);
            } else {
              console.log('Token appears to be valid via alternative method');
              setIsValidToken(true);
            }
          } catch (altError) {
            console.error('Alternative verification failed:', altError);
            setIsValidToken(false);
          }
        } else {
          console.log('Session set successfully');
          setIsValidToken(true);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsValidToken(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Erro de validação", {
        description: "Por favor, preencha todos os campos"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Erro de validação", {
        description: "As senhas não coincidem"
      });
      return;
    }

    if (password.length < 6) {
      toast.error("Erro de validação", {
        description: "A senha deve ter pelo menos 6 caracteres"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        
        // Tratar erros específicos
        if (error.message.includes('Invalid token') || error.message.includes('Token expired')) {
          toast.error("Link expirado", {
            description: "O link de redefinição expirou. Solicite um novo link."
          });
          setTimeout(() => {
            navigate('/forgot-password');
          }, 3000);
          return;
        }
        
        throw error;
      }

      toast.success("Senha redefinida", {
        description: "Sua senha foi redefinida com sucesso!"
      });

      // Redireciona para o login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error("Erro ao redefinir senha", {
        description: error.message || "Ocorreu um erro ao redefinir sua senha."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFAE6] p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD600] mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando link de redefinição...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFAE6] p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Link inválido ou expirado</CardTitle>
            <CardDescription>
              O link de redefinição de senha é inválido ou já expirou.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-500 text-sm">
              Solicite um novo link de redefinição de senha.
            </p>
            <Button 
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-[#FFD600] hover:bg-[#E6C000] text-black"
            >
              Solicitar novo link
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Voltar para o login
            </Button>
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
          <CardTitle className="text-2xl">Redefinir senha</CardTitle>
          <CardDescription className="text-center">
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700">
                A senha deve ter pelo menos 6 caracteres.
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#FFD600] hover:bg-[#E6C000] text-black" 
              disabled={isLoading}
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword; 