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
    const verifyToken = () => {
      const accessToken = searchParams.get('access_token');
      const type = searchParams.get('type');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('Reset password params:', { 
        accessToken: accessToken ? `${accessToken.slice(0, 10)}...` : null,
        type, 
        error, 
        errorDescription 
      });

      // Se há erro nos parâmetros da URL, mostrar como inválido
      if (error) {
        console.error('URL contains error:', error, errorDescription);
        setIsValidToken(false);
        setIsVerifying(false);
        return;
      }

      // Verificação básica de parâmetros
      if (!accessToken || type !== 'recovery') {
        console.log('Invalid params - missing token or wrong type');
        setIsValidToken(false);
        setIsVerifying(false);
        return;
      }

      // Para tokens muito curtos (como "629480"), assumir como inválido
      if (accessToken.length < 20) {
        console.log('Token too short, likely invalid:', accessToken.length);
        setIsValidToken(false);
        setIsVerifying(false);
        return;
      }

      // Para tokens em formato hash (hexadecimal), aceitar diretamente
      if (/^[a-f0-9]+$/i.test(accessToken) && accessToken.length >= 32) {
        console.log('✅ Token appears to be valid hash format', {
          length: accessToken.length,
          sample: accessToken.slice(0, 20) + '...'
        });
        setIsValidToken(true);
        setIsVerifying(false);
        return;
      }

      // Para tokens JWT, tentar validar formato
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          // Parece ser um JWT, tentar decodificar
          const payload = JSON.parse(atob(tokenParts[1]));
          const now = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < now) {
            console.log('JWT token is expired:', new Date(payload.exp * 1000));
            setIsValidToken(false);
          } else {
            console.log('✅ JWT token format seems valid');
            setIsValidToken(true);
          }
        } else {
          console.log('❌ Token is not in expected format');
          setIsValidToken(false);
        }
      } catch (jwtError) {
        console.log('❌ Token validation failed:', jwtError.message);
        setIsValidToken(false);
      }

      setIsVerifying(false);
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
      const accessToken = searchParams.get('access_token');

      console.log('Attempting password update with token...', {
        tokenLength: accessToken?.length,
        isHexFormat: /^[a-f0-9]+$/i.test(accessToken || '')
      });

      // Para tokens em formato hash, usar verifyOtp primeiro
      if (accessToken && /^[a-f0-9]+$/i.test(accessToken) && accessToken.length >= 32) {
        console.log('Using verifyOtp approach for hash token...');
        
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: accessToken,
          type: 'recovery'
        });

        if (verifyError) {
          console.error('VerifyOtp error:', verifyError);
          throw verifyError;
        }

        console.log('Token verified, updating password...', data);

        // Estabelecer sessão se retornada
        if (data.session) {
          await supabase.auth.setSession(data.session);
        }
        
        // Após verificação bem-sucedida, atualizar senha
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });

        if (updateError) {
          console.error('Password update error after verification:', updateError);
          throw updateError;
        }
      } else {
        // Para tokens JWT, usar updateUser diretamente
        console.log('Using updateUser approach for JWT token...');
        
        const { error } = await supabase.auth.updateUser(
          { password: password },
          { 
            emailRedirectTo: window.location.origin + '/login'
          }
        );

        if (error) {
          console.error('Password update error:', error);
          throw error;
        }
      }

      console.log('✅ Password updated successfully');
      toast.success("Senha redefinida", {
        description: "Sua senha foi redefinida com sucesso!"
      });

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