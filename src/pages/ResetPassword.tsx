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
  const [tokenProcessed, setTokenProcessed] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processToken = async () => {
      // Check sessionStorage to prevent reprocessing across re-renders
      const hasProcessedToken = sessionStorage.getItem('reset-token-processed');
      if (hasProcessedToken || tokenProcessed) {
        console.log('Token already processed, skipping...');
        return;
      }
      // Interceptar imediatamente para evitar redirect automático do Supabase
      const currentUrl = window.location.href;
      const url = new URL(currentUrl);
      const accessToken = url.searchParams.get('access_token');
      const type = url.searchParams.get('type');
      const error = url.searchParams.get('error');

      console.log('Processing reset token immediately:', { 
        accessToken: accessToken ? `${accessToken.slice(0, 10)}...` : null,
        type, 
        error
      });

      // Limpar URL para evitar reprocessamento
      if (accessToken) {
        window.history.replaceState({}, document.title, '/redefinir-senha-limpa');
      }

      if (error) {
        console.error('URL contains error:', error);
        setIsValidToken(false);
        setIsVerifying(false);
        return;
      }

      if (!accessToken || type !== 'recovery') {
        console.log('Invalid params');
        setIsValidToken(false);
        setIsVerifying(false);
        return;
      }

      if (accessToken.length < 20) {
        console.log('Token too short');
        setIsValidToken(false);
        setIsVerifying(false);
        return;
      }

      // Processar token hash
      if (/^[a-f0-9]+$/i.test(accessToken) && accessToken.length >= 32) {
        try {
          console.log('Verifying hash token...');
          
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: accessToken,
            type: 'recovery'
          });

          if (verifyError) {
            console.error('Verification failed:', verifyError.message);
            setIsValidToken(false);
            setIsVerifying(false);
            return;
          }

          console.log('Token verified, establishing session...');
          
          if (data.session) {
            await supabase.auth.setSession(data.session);
            console.log('Session established successfully');
          }
          
          // Mark as processed in both state and sessionStorage
          sessionStorage.setItem('reset-token-processed', 'true');
          setTokenProcessed(true);
          setIsValidToken(true);
          setIsVerifying(false);
          return;
        } catch (error: any) {
          console.error('Token processing error:', error.message);
          setIsValidToken(false);
          setIsVerifying(false);
          return;
        }
      }

      // JWT tokens
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const now = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < now) {
            console.log('JWT expired');
            setIsValidToken(false);
          } else {
            console.log('JWT valid');
            sessionStorage.setItem('reset-token-processed', 'true');
            setTokenProcessed(true);
            setIsValidToken(true);
          }
        } else {
          setIsValidToken(false);
        }
      } catch {
        setIsValidToken(false);
      }

      setIsVerifying(false);
    };

    processToken();
  }, []);

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
      console.log('Updating password...');
      
      // Como a sessão já foi estabelecida no useEffect, apenas atualizar a senha
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      console.log('✅ Password updated successfully');
      toast.success("Senha redefinida", {
        description: "Sua senha foi redefinida com sucesso!"
      });

      // Clear the processed token flag
      sessionStorage.removeItem('reset-token-processed');

      // Fazer logout para limpar qualquer sessão
      await supabase.auth.signOut();

      // Redireciona para o login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('Password update error:', error);
      
      // Tratar erros específicos primeiro
      if (error.message.includes('Invalid token') || error.message.includes('Token expired')) {
        toast.error("Link expirado", {
          description: "O link de redefinição expirou. Solicite um novo link."
        });
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
        return;
      }

      if (error.message.includes('Auth session missing')) {
        toast.error("Sessão expirada", {
          description: "Sua sessão expirou. Tente solicitar um novo link de redefinição."
        });
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
        return;
      }

      // Mensagens de erro mais específicas
      let errorMessage = "Ocorreu um erro ao redefinir sua senha.";
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
      } else if (error.message.includes('Invalid token')) {
        errorMessage = "Link inválido ou expirado. Solicite um novo link.";
      } else if (error.message.includes('403')) {
        errorMessage = "Link inválido ou expirado. Solicite um novo link.";
      }
      
      toast.error("Erro ao redefinir senha", {
        description: errorMessage
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
    const accessToken = searchParams.get('access_token');
    const tokenLength = accessToken?.length || 0;
    
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
              O link de redefinição de senha não pôde ser validado.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg text-left">
              <p className="text-xs text-gray-600">
                <strong>Detalhes técnicos:</strong><br/>
                Token length: {tokenLength} caracteres<br/>
                {tokenLength < 20 && "⚠️ Token muito curto (esperado: >20)"}<br/>
                {tokenLength === 0 && "❌ Token ausente na URL"}
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-500 text-sm">
                Possíveis causas:
              </p>
              <ul className="text-xs text-gray-500 text-left space-y-1">
                <li>• Link expirou (válido por 1 hora)</li>
                <li>• Link já foi usado</li>
                <li>• Link foi truncado/corrompido</li>
                <li>• Problemas de configuração do email</li>
              </ul>
            </div>
            
            <div className="space-y-2">
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