import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorVerificationProps {
  onVerificationComplete: () => void;
  onCancel: () => void;
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  onVerificationComplete,
  onCancel
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      toast.error('Digite o código de verificação');
      return;
    }

    setIsVerifying(true);
    try {
      // Listar fatores MFA disponíveis
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const factor = factors?.totp?.[0];
      
      if (!factor) {
        throw new Error('Fator de autenticação não encontrado');
      }

      // Criar challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factor.id
      });

      if (challengeError) throw challengeError;

      // Verificar código
      const { error } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challengeData.id,
        code: verificationCode
      });

      if (error) {
        throw error;
      }

      toast.success('Verificação 2FA bem-sucedida');
      onVerificationComplete();
      
    } catch (error: any) {
      console.error('Erro na verificação 2FA:', error);
      toast.error('Código de verificação inválido', {
        description: 'Verifique o código no seu aplicativo autenticador'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle>Verificação em Duas Etapas</CardTitle>
        <CardDescription>
          {useBackupCode 
            ? 'Digite um dos seus códigos de backup'
            : 'Digite o código de 6 dígitos do seu aplicativo autenticador'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">
              {useBackupCode ? 'Código de backup' : 'Código de verificação'}
            </Label>
            <Input
              id="verification-code"
              type="text"
              placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value;
                if (useBackupCode) {
                  // Para códigos de backup, permitir letras, números e hífen
                  setVerificationCode(value.toUpperCase().slice(0, 9));
                } else {
                  // Para códigos TOTP, apenas números
                  setVerificationCode(value.replace(/\D/g, '').slice(0, 6));
                }
              }}
              maxLength={useBackupCode ? 9 : 6}
              className="text-center text-lg tracking-widest"
              autoComplete="one-time-code"
              required
              disabled={isVerifying}
            />
          </div>

          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isVerifying || verificationCode.length < (useBackupCode ? 8 : 6)}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar'
              )}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setVerificationCode('');
                }}
                disabled={isVerifying}
              >
                {useBackupCode 
                  ? 'Usar código do aplicativo' 
                  : 'Usar código de backup'
                }
              </Button>
              
              <div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={onCancel}
                  disabled={isVerifying}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 