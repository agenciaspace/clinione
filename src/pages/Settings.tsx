import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { 
  User, 
  Lock, 
  Bell, 
  PaintBucket, 
  Languages, 
  Clock, 
  KeyRound, 
  Mail, 
  AlertTriangle,
  CheckCircle,
  Shield,
  CreditCard,
  Trash2
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    profession: 'Médico'
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de atualização de perfil
    setTimeout(() => {
      setLoading(false);
      toast("Perfil atualizado com sucesso");
    }, 1000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.new !== password.confirm) {
      toast("As senhas não conferem", {
        description: "Por favor, confirme sua nova senha corretamente."
      });
      return;
    }
    
    setLoading(true);
    
    // Simulação de atualização de senha
    setTimeout(() => {
      setLoading(false);
      toast("Senha atualizada com sucesso");
      setPassword({ current: '', new: '', confirm: '' });
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie suas preferências e configurações</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 lg:max-w-[600px]">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" /> Segurança
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <PaintBucket className="h-4 w-4 mr-2" /> Aparência
          </TabsTrigger>
        </TabsList>

        {/* Tab de Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize suas informações pessoais e de contato</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4 flex flex-col items-center justify-start">
                    <div className="mb-4 w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border">
                      <User className="h-16 w-16" />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm" type="button">
                        Alterar foto
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500" type="button">
                        Remover
                      </Button>
                    </div>
                  </div>

                  <div className="md:w-3/4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={profileData.name} 
                          onChange={handleProfileChange} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={profileData.email} 
                          onChange={handleProfileChange} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={profileData.phone} 
                          onChange={handleProfileChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profession">Profissão</Label>
                        <Select 
                          value={profileData.profession} 
                          onValueChange={(value) => setProfileData({...profileData, profession: value})}
                        >
                          <SelectTrigger id="profession">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Médico">Médico</SelectItem>
                            <SelectItem value="Enfermeiro">Enfermeiro</SelectItem>
                            <SelectItem value="Fisioterapeuta">Fisioterapeuta</SelectItem>
                            <SelectItem value="Nutricionista">Nutricionista</SelectItem>
                            <SelectItem value="Psicólogo">Psicólogo</SelectItem>
                            <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                            <SelectItem value="Administrador">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar alterações'}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Segurança */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Atualize sua senha periodicamente para maior segurança</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Senha atual</Label>
                  <Input 
                    id="current" 
                    name="current" 
                    type="password" 
                    value={password.current} 
                    onChange={handlePasswordChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">Nova senha</Label>
                  <Input 
                    id="new" 
                    name="new" 
                    type="password" 
                    value={password.new} 
                    onChange={handlePasswordChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar nova senha</Label>
                  <Input 
                    id="confirm" 
                    name="confirm" 
                    type="password" 
                    value={password.confirm} 
                    onChange={handlePasswordChange} 
                    required 
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Atualizando...' : 'Atualizar senha'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Autenticação de dois fatores</CardTitle>
              <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium">Autenticação por SMS</h4>
                    <Badge variant="outline" className="ml-2">
                      Recomendado
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receba um código por SMS quando fizer login
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Autenticação por aplicativo</h4>
                  <p className="text-sm text-muted-foreground">
                    Use um aplicativo como Google Authenticator
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Backup de códigos</h4>
                  <p className="text-sm text-muted-foreground">
                    Gere códigos de backup para acesso emergencial
                  </p>
                </div>
                <Button variant="outline" size="sm">Gerar códigos</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessões ativas</CardTitle>
              <CardDescription>Gerencie seus dispositivos conectados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Este dispositivo</h4>
                      <p className="text-sm text-gray-500">Chrome • Windows • São Paulo, Brasil</p>
                    </div>
                  </div>
                  <Badge>Atual</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">iPhone 12</h4>
                      <p className="text-sm text-gray-500">Safari • iOS • São Paulo, Brasil • Há 2 dias</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    Encerrar
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline">Encerrar todas as outras sessões</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Zona de perigo</CardTitle>
              <CardDescription>Ações irreversíveis de segurança</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-red-200 rounded-md bg-red-50">
                <div className="flex items-start space-x-4">
                  <div className="mt-0.5">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-red-500">Excluir conta</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
                    </p>
                    <div className="mt-4">
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir minha conta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações por email</CardTitle>
              <CardDescription>Escolha quais emails você deseja receber</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Confirmações de agendamento</h4>
                  <p className="text-sm text-muted-foreground">
                    Receba confirmações quando uma consulta for agendada
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Lembretes de consulta</h4>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes antes das consultas agendadas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Atualizações do sistema</h4>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações sobre novidades e melhorias
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Newsletter</h4>
                  <p className="text-sm text-muted-foreground">
                    Receba dicas e novidades sobre saúde e bem-estar
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações no aplicativo</CardTitle>
              <CardDescription>Gerencie suas notificações no sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Novos agendamentos</h4>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando houver um novo agendamento
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Cancelamentos</h4>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando uma consulta for cancelada
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Mensagens</h4>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando receber novas mensagens
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Alertas financeiros</h4>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre pagamentos e faturas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Aparência */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de exibição</CardTitle>
              <CardDescription>Personalize a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-2 cursor-pointer bg-white flex flex-col items-center">
                    <div className="w-full h-24 rounded bg-white border mb-2"></div>
                    <span className="text-sm">Claro</span>
                  </div>
                  <div className="border rounded-lg p-2 cursor-pointer flex flex-col items-center">
                    <div className="w-full h-24 rounded bg-gray-900 border border-gray-800 mb-2"></div>
                    <span className="text-sm">Escuro</span>
                  </div>
                  <div className="border rounded-lg p-2 cursor-pointer flex flex-col items-center">
                    <div className="w-full h-24 rounded bg-gradient-to-b from-white to-gray-900 border mb-2"></div>
                    <span className="text-sm">Sistema</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Densidade</Label>
                <Select defaultValue="compact">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfortable">Confortável</SelectItem>
                    <SelectItem value="compact">Compacto</SelectItem>
                    <SelectItem value="dense">Denso</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Controla o espaçamento e o tamanho dos elementos na interface
                </p>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select defaultValue="pt-BR">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fuso horário</Label>
                <Select defaultValue="America/Sao_Paulo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Horário de Brasília (UTC-3)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="Europe/London">GMT (UTC+0)</SelectItem>
                    <SelectItem value="Europe/Paris">Central European Time (UTC+1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acessibilidade</CardTitle>
              <CardDescription>Ajuste as configurações de acessibilidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Contraste alto</h4>
                  <p className="text-sm text-muted-foreground">
                    Aumenta o contraste para melhor visibilidade
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Reduzir movimento</h4>
                  <p className="text-sm text-muted-foreground">
                    Diminui ou remove animações da interface
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />

              <div className="space-y-2">
                <Label>Tamanho da fonte</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequena</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                    <SelectItem value="x-large">Extra grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
