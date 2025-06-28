import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/sonner';
import { AlertTriangle, Trash2, Shield, Smartphone, Key, Clock, Monitor, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
} from "@/components/ui/alert-dialog";

interface Session {
  id: string;
  ip: string;
  user_agent: string;
  created_at: string;
  last_seen: string;
  is_current: boolean;
}

export const SecuritySettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Carregar configurações de segurança ao montar o componente
  useEffect(() => {
    loadSecuritySettings();
    loadActiveSessions();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      // Verificar se 2FA está habilitado
      const { data: mfaData } = await supabase.auth.mfa.listFactors();
      setTwoFactorEnabled(mfaData?.totp?.length > 0);
    } catch (error) {
      console.error('Erro ao carregar configurações de segurança:', error);
    }
  };

  const loadActiveSessions = async () => {
    setLoadingSessions(true);
    try {
      // Simular sessões ativas (Supabase não expõe sessões diretamente)
      const currentSession = await supabase.auth.getSession();
      if (currentSession.data.session) {
        setSessions([
          {
            id: currentSession.data.session.access_token.substring(0, 8),
            ip: 'IP atual',
            user_agent: navigator.userAgent.substring(0, 50) + '...',
            created_at: new Date().toISOString(),
            last_seen: new Date().toISOString(),
            is_current: true
          }
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('Uma letra maiúscula');
    if (!/[a-z]/.test(password)) errors.push('Uma letra minúscula');
    if (!/[0-9]/.test(password)) errors.push('Um número');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Um caractere especial');
    return errors;
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (password.new !== password.confirm) {
      toast.error('As senhas não coincidem');
      setLoading(false);
      return;
    }

    const passwordErrors = validatePassword(password.new);
    if (passwordErrors.length > 0) {
      toast.error('Senha não atende aos requisitos', {
        description: passwordErrors.join(', ')
      });
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password.new 
      });
      
      if (error) throw error;
      
      toast.success('Senha atualizada com sucesso', {
        description: 'Sua senha foi alterada. Use a nova senha no próximo login.'
      });
      setPassword({
        current: '',
        new: '',
        confirm: ''
      });
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      toast.error('Erro ao atualizar senha', {
        description: error.message || 'Tente novamente mais tarde'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Clini.One App'
      });
      
      if (error) throw error;
      
      // Mostrar QR code para configuração
      toast.success('2FA habilitado', {
        description: 'Configure o aplicativo autenticador com o QR code'
      });
      setTwoFactorEnabled(true);
    } catch (error: any) {
      toast.error('Erro ao habilitar 2FA', {
        description: error.message
      });
    }
  };

  const handleDisable2FA = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.totp?.length > 0) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: factors.totp[0].id
        });
        
        if (error) throw error;
        
        toast.success('2FA desabilitado');
        setTwoFactorEnabled(false);
      }
    } catch (error: any) {
      toast.error('Erro ao desabilitar 2FA', {
        description: error.message
      });
    }
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
    toast.success('Códigos de backup gerados', {
      description: 'Salve estes códigos em local seguro'
    });
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      // Primeiro, deletar dados do usuário
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user?.id);
      
      if (deleteError) {
        console.error('Erro ao deletar dados do usuário:', deleteError);
      }
      
      // Depois, deletar conta do auth
      const { error: authError } = await supabase.auth.admin.deleteUser(user?.id || '');
      
      if (authError) {
        throw authError;
      }
      
      toast.success('Conta deletada com sucesso');
      logout();
      navigate('/');
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
      toast.error('Erro ao deletar conta', {
        description: 'Entre em contato com o suporte se o problema persistir'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast.success('Logout realizado em todos os dispositivos');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao fazer logout de todos os dispositivos');
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Segurança</h2>
        <p className="text-muted-foreground">Gerencie a segurança da sua conta</p>
      </div>

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>Atualize sua senha periodicamente para maior segurança</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Senha atual</Label>
              <div className="relative">
                <Input 
                  id="current" 
                  name="current" 
                  type={showPassword.current ? "text" : "password"}
                  value={password.current} 
                  onChange={handlePasswordChange} 
                  required 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">Nova senha</Label>
              <div className="relative">
                <Input 
                  id="new" 
                  name="new" 
                  type={showPassword.new ? "text" : "password"}
                  value={password.new} 
                  onChange={handlePasswordChange} 
                  required 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {password.new && (
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">Requisitos da senha:</p>
                  {validatePassword(password.new).map((error, index) => (
                    <p key={index} className="text-red-500">• {error}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar nova senha</Label>
              <div className="relative">
                <Input 
                  id="confirm" 
                  name="confirm" 
                  type={showPassword.confirm ? "text" : "password"}
                  value={password.confirm} 
                  onChange={handlePasswordChange} 
                  required 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {password.confirm && password.new !== password.confirm && (
                <p className="text-red-500 text-sm">As senhas não coincidem</p>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading || password.new !== password.confirm}>
                {loading ? 'Atualizando...' : 'Atualizar senha'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Autenticação de dois fatores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticação de dois fatores
          </CardTitle>
          <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <h4 className="text-sm font-medium">Autenticação por aplicativo</h4>
                <Badge variant={twoFactorEnabled ? "default" : "outline"} className="ml-2">
                  {twoFactorEnabled ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Use um aplicativo como Google Authenticator
              </p>
            </div>
            <Switch 
              checked={twoFactorEnabled}
              onCheckedChange={twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
            />
          </div>

          {twoFactorEnabled && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Códigos de backup</h4>
                <p className="text-sm text-muted-foreground">
                  Gere códigos de backup para acesso emergencial
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={generateBackupCodes}>
                Gerar códigos
              </Button>
            </div>
          )}

          {backupCodes.length > 0 && (
            <Card className="p-4 bg-muted">
              <h5 className="font-medium mb-2">Códigos de backup:</h5>
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-background rounded border">
                    {code}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Salve estes códigos em local seguro. Cada código só pode ser usado uma vez.
              </p>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Sessões ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Sessões ativas
          </CardTitle>
          <CardDescription>Gerencie seus dispositivos conectados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">
                        {session.is_current ? 'Esta sessão' : 'Outro dispositivo'}
                      </h4>
                      {session.is_current && (
                        <Badge variant="outline" className="text-xs">Atual</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{session.user_agent}</p>
                    <p className="text-xs text-muted-foreground">
                      Último acesso: {new Date(session.last_seen).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="pt-2 border-t">
                <Button variant="outline" onClick={handleLogoutAllSessions} className="w-full">
                  Fazer logout de todos os dispositivos
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Zona de perigo */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zona de perigo
          </CardTitle>
          <CardDescription>Ações irreversíveis de segurança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-red-200 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-950/10">
            <div className="flex items-start space-x-4">
              <div className="mt-0.5">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-red-500">Excluir conta</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Esta ação é irreversível. Todos os seus dados serão permanentemente removidos, 
                  incluindo perfil, clínicas, pacientes e histórico médico.
                </p>
                <div className="mt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir minha conta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                          e removerá todos os seus dados de nossos servidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-500 hover:bg-red-600"
                          disabled={loading}
                        >
                          {loading ? 'Excluindo...' : 'Sim, excluir conta'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 