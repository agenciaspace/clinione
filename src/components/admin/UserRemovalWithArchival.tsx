import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Archive, 
  AlertTriangle, 
  FileText, 
  Clock, 
  Shield,
  UserX,
  Calendar
} from 'lucide-react';
import { useUserArchival } from '@/hooks/useUserArchival';
import { useClinic } from '@/contexts/ClinicContext';
import { toast } from '@/components/ui/sonner';

interface UserRemovalWithArchivalProps {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
  onUserRemoved: () => void;
  children: React.ReactNode; // Trigger element (usually a button)
}

export const UserRemovalWithArchival: React.FC<UserRemovalWithArchivalProps> = ({
  user,
  onUserRemoved,
  children
}) => {
  const { activeClinic } = useClinic();
  const { archiveUser, isArchiving } = useUserArchival();
  
  const [isOpen, setIsOpen] = useState(false);
  const [archivalReason, setArchivalReason] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [step, setStep] = useState<'warning' | 'details' | 'confirmation'>('warning');

  const handleArchiveUser = async () => {
    if (!activeClinic || !archivalReason.trim()) {
      toast.error('Por favor, informe o motivo do arquivamento');
      return;
    }

    if (confirmationText !== 'ARQUIVAR') {
      toast.error('Digite "ARQUIVAR" para confirmar');
      return;
    }

    const result = await archiveUser(user.id, activeClinic.id, archivalReason);
    
    if (result) {
      setIsOpen(false);
      onUserRemoved();
      
      // Reset form
      setArchivalReason('');
      setConfirmationText('');
      setStep('warning');
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setArchivalReason('');
    setConfirmationText('');
    setStep('warning');
  };

  const getRetentionDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 5);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {step === 'warning' && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Remover Usuário do Sistema</span>
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>
                    Você está prestes a remover <strong>{user.name || user.email}</strong> do sistema.
                  </p>
                  
                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Conformidade Legal</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm space-y-2">
                        <p><strong>Importante:</strong> Os dados médicos deste usuário serão arquivados por questões legais.</p>
                        <ul className="list-disc list-inside space-y-1 text-amber-700">
                          <li>Prontuários médicos devem ser preservados por 5 anos</li>
                          <li>Dados serão mantidos até <strong>{getRetentionDate()}</strong></li>
                          <li>Usuário perderá acesso imediato ao sistema</li>
                          <li>Dados podem ser restaurados se necessário</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span><strong>Usuário:</strong> {user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm mt-1">
                      <Badge variant="secondary">{user.role}</Badge>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>
                Cancelar
              </AlertDialogCancel>
              <Button onClick={() => setStep('details')} variant="default">
                Continuar
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === 'details' && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <Archive className="h-5 w-5" />
                <span>Detalhes do Arquivamento</span>
              </AlertDialogTitle>
              <AlertDialogDescription>
                Informe os detalhes do arquivamento para auditoria e conformidade legal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Motivo do Arquivamento *</Label>
                <Textarea
                  id="reason"
                  placeholder="Ex: Desligamento do funcionário, fim do contrato, solicitação do próprio usuário..."
                  value={archivalReason}
                  onChange={(e) => setArchivalReason(e.target.value)}
                  className="min-h-[100px] mt-1"
                />
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Cronograma de Retenção</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Arquivamento: Imediato</li>
                        <li>• Retenção legal: 5 anos</li>
                        <li>• Remoção definitiva: Após {getRetentionDate()}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setStep('warning')}>
                Voltar
              </Button>
              <Button 
                onClick={() => setStep('confirmation')}
                disabled={!archivalReason.trim()}
              >
                Próximo
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === 'confirmation' && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <UserX className="h-5 w-5 text-red-500" />
                <span>Confirmação Final</span>
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>
                    Esta ação removerá <strong>{user.email}</strong> do sistema e arquivará 
                    todos os dados médicos associados.
                  </p>

                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="text-sm text-red-800 space-y-2">
                        <p className="font-medium">Resumo da Ação:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Usuário será removido do sistema</li>
                          <li>Acesso será revogado imediatamente</li>
                          <li>Dados médicos serão arquivados por 5 anos</li>
                          <li>Motivo: {archivalReason}</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <Label htmlFor="confirmation">
                      Digite <strong>"ARQUIVAR"</strong> para confirmar:
                    </Label>
                    <Input
                      id="confirmation"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="ARQUIVAR"
                      className="mt-1"
                    />
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setStep('details')}>
                Voltar
              </Button>
              <Button 
                onClick={handleArchiveUser}
                disabled={confirmationText !== 'ARQUIVAR' || isArchiving}
                variant="destructive"
              >
                {isArchiving ? 'Arquivando...' : 'Arquivar Usuário'}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};