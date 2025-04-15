
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, AlertCircle } from 'lucide-react';

interface EmailConfirmationMessageProps {
  email: string | null | undefined;
  onResendEmail?: () => void;
  onLogin?: () => void;
}

const EmailConfirmationMessage: React.FC<EmailConfirmationMessageProps> = ({
  email,
  onResendEmail,
  onLogin
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <Mail className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
        <CardTitle className="text-xl">Confirme seu e-mail</CardTitle>
        <CardDescription>
          Enviamos um link de confirmação para{' '}
          <span className="font-semibold">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <p className="text-sm text-blue-700">
              Você precisa confirmar seu e-mail antes de poder fazer login. 
              Por favor, verifique sua caixa de entrada e clique no link de confirmação.
            </p>
          </div>
        </div>
        <p className="text-gray-500 text-sm">
          Se você não encontrar o e-mail, verifique sua pasta de spam 
          ou solicite um novo e-mail de confirmação.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {onResendEmail && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onResendEmail}
          >
            Reenviar e-mail de confirmação
          </Button>
        )}
        {onLogin && (
          <Button 
            variant="link" 
            className="w-full"
            onClick={onLogin}
          >
            Voltar para o login
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EmailConfirmationMessage;
