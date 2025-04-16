import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsListWithMobileSupport, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';
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
  Trash2,
  MessageSquare,
  Server,
  Webhook
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import WebhookSettings from '@/components/settings/WebhookSettings';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const [currentTab, setCurrentTab] = useState('profile');

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

  // SMTP Configuration state
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '587',
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    secure: false
  });

  // WhatsApp Configuration state
  const [whatsappConfig, setWhatsAppConfig] = useState({
    phoneNumber: '',
    isVerified: false,
    apiKey: ''
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  // Definição dos itens de abas para fácil renderização
  const tabItems = [
    { value: 'profile', label: 'Perfil', icon: <User className="h-4 w-4 mr-2" /> },
    { value: 'security', label: 'Segurança', icon: <Lock className="h-4 w-4 mr-2" /> },
    { value: 'notifications', label: 'Notificações', icon: <Bell className="h-4 w-4 mr-2" /> },
    { value: 'appearance', label: 'Aparência', icon: <PaintBucket className="h-4 w-4 mr-2" /> },
    { value: 'smtp', label: 'Email', icon: <Mail className="h-4 w-4 mr-2" /> },
    { value: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { value: 'webhooks', label: 'Webhooks', icon: <Webhook className="h-4 w-4 mr-2" /> },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie suas preferências e configurações</p>
      </div>

      <Tabs 
        defaultValue="profile" 
        value={currentTab}
        onValueChange={setCurrentTab}
        className="w-full"
      >
        <TabsListWithMobileSupport 
          className="grid w-full grid-cols-1 md:grid-cols-7"
          showScrollButtons={isMobile}
        >
          {tabItems.map((item) => (
            <TabsTrigger 
              key={item.value} 
              value={item.value} 
              className="flex items-center justify-center"
              onClick={() => setCurrentTab(item.value)}
            >
              {item.icon}
              <span className={isMobile && item.value !== currentTab ? "sr-only" : ""}>{item.label}</span>
            </TabsTrigger>
          ))}
        </TabsListWithMobileSupport>

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

        {/* Tab de Configurações SMTP */}
        <TabsContent value="smtp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Email (SMTP)</CardTitle>
              <CardDescription>Configure os detalhes do servidor SMTP para envio de emails</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSmtpConfig} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Servidor SMTP</Label>
                    <Input
                      id="host"
                      name="host"
                      placeholder="smtp.gmail.com"
                      value={smtpConfig.host}
                      onChange={handleSmtpChange}
                    />
                    <p className="text-xs text-gray-500">
                      Ex: smtp.gmail.com, smtp.outlook.com
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Porta</Label>
                    <Select 
                      value={smtpConfig.port} 
                      onValueChange={(value) => setSmtpConfig({...smtpConfig, port: value})}
                    >
                      <SelectTrigger id="port">
                        <SelectValue placeholder="Selecione a porta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25 (SMTP)</SelectItem>
                        <SelectItem value="465">465 (SMTP com SSL)</SelectItem>
                        <SelectItem value="587">587 (SMTP com TLS)</SelectItem>
                        <SelectItem value="2525">2525 (SMTP alternativo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuário</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="seu.email@exemplo.com"
                      value={smtpConfig.username}
                      onChange={handleSmtpChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={smtpConfig.password}
                      onChange={handleSmtpChange}
                    />
                    <p className="text-xs text-gray-500">
                      Para Gmail, use uma senha de aplicativo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">Email de envio</Label>
                    <Input
                      id="fromEmail"
                      name="fromEmail"
                      placeholder="noreply@suaclinica.com"
                      value={smtpConfig.fromEmail}
                      onChange={handleSmtpChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">Nome de exibição</Label>
                    <Input
                      id="fromName"
                      name="fromName"
                      placeholder="Clínica XYZ"
                      value={smtpConfig.fromName}
                      onChange={handleSmtpChange}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="secure" 
                    checked={smtpConfig.secure} 
                    onCheckedChange={(checked) => setSmtpConfig({...smtpConfig, secure: checked})}
                  />
                  <Label htmlFor="secure">Usar conexão segura (SSL/TLS)</Label>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleTestSmtp}
                  >
                    <Server className="mr-2 h-4 w-4" /> Testar conexão
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar configurações'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Templates de email</CardTitle>
              <CardDescription>Configure as mensagens para diferentes tipos de comunicação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Tipos de templates</Label>
                  <Select defaultValue="appointment_confirmation">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment_confirmation">Confirmação de agendamento</SelectItem>
                      <SelectItem value="appointment_reminder">Lembrete de consulta</SelectItem>
                      <SelectItem value="password_reset">Redefinição de senha</SelectItem>
                      <SelectItem value="welcome">Boas-vindas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="subject">Assunto do email</Label>
                  <Input
                    id="subject"
                    placeholder="Confirmação da sua consulta na Clínica XYZ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Conteúdo do email</Label>
                  <Textarea
                    id="template"
                    placeholder="Olá {nome_paciente}, sua consulta está confirmada para {data} às {hora} com Dr(a). {nome_médico}."
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-gray-500">
                    Você pode usar as seguintes variáveis: {'{nome_paciente}'}, {'{data}'}, {'{hora}'}, {'{nome_médico}'}, {'{especialidade}'}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button>Salvar template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conectar WhatsApp</CardTitle>
              <CardDescription>Conecte seu número de WhatsApp para enviar notificações aos pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnectWhatsApp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Número do WhatsApp</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="+5511999999999"
                      value={whatsappConfig.phoneNumber}
                      onChange={handleWhatsAppChange}
                      disabled={whatsappConfig.isVerified}
                      className="flex-1"
                    />
                    {!whatsappConfig.isVerified ? (
                      <Button type="submit" disabled={loading || showVerificationInput}>
                        {loading ? 'Enviando...' : 'Conectar'}
                      </Button>
                    ) : (
                      <Button variant="outline" type="button" onClick={() => setWhatsAppConfig({...whatsappConfig, isVerified: false})}>
                        Alterar
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Digite seu número com código do país e DDD. Ex: +5511999999999
                  </p>
                </div>

                {showVerificationInput && !whatsappConfig.isVerified && (
                  <div className="space-y-2 border p-4 rounded-md bg-gray-50">
                    <Label htmlFor="verificationCode">Código de verificação</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Digite o código recebido"
                        className="flex-1"
                        maxLength={6}
                      />
                      <Button 
                        type="button" 
                        onClick={handleVerifyWhatsApp} 
                        disabled={loading}
                      >
                        {loading ? 'Verificando...' : 'Verificar'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Enviamos um código de 6 dígitos para o seu WhatsApp
                    </p>
                  </div>
                )}

                {whatsappConfig.isVerified && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-700">WhatsApp conectado com sucesso!</span>
                  </div>
                )}

                {whatsappConfig.isVerified && (
                  <div className="space-y-4 mt-4 pt-4 border-t">
                    <h3 className="font-medium">Configurações de mensagens</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">Chave da API (opcional)</Label>
                      <Input
                        id="apiKey"
                        name="apiKey"
                        value={whatsappConfig.apiKey}
                        onChange={handleWhatsAppChange}
                        placeholder="Chave para integração com WhatsApp Business API"
                      />
                      <p className="text-xs text-gray-500">
                        Necessário apenas para envio em massa ou integrações avançadas
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Enviar notificações para:</h4>
                      
                      <div className="grid gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="notif_appointments" />
                          <Label htmlFor="notif_appointments">Confirmações de agendamento</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch id="notif_reminders" defaultChecked />
                          <Label htmlFor="notif_reminders">Lembretes de consulta</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch id="notif_cancellations" />
                          <Label htmlFor="notif_cancellations">Cancelamentos</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch id="notif_campaigns" defaultChecked />
                          <Label htmlFor="notif_campaigns">Campanhas de marketing</Label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button type="button">
                        Salvar preferências
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {whatsappConfig.isVerified && (
            <Card>
              <CardHeader>
                <CardTitle>Modelos de mensagens</CardTitle>
                <CardDescription>Configure os textos para cada tipo de comunicação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de mensagem</Label>
                    <Select defaultValue="appointment_confirmation">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appointment_confirmation">Confirmação de agendamento</SelectItem>
                        <SelectItem value="appointment_reminder">Lembrete de consulta</SelectItem>
                        <SelectItem value="rescheduling">Reagendamento</SelectItem>
                        <SelectItem value="cancellation">Cancelamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="whatsapp_template">Modelo de mensagem</Label>
                    <Textarea
                      id="whatsapp_template"
                      placeholder="Olá {nome_paciente}, sua consulta está confirmada para {data} às {hora} com Dr(a). {nome_médico}."
                      className="min-h-[150px]"
                    />
                    <p className="text-xs text-gray-500">
                      Você pode usar as seguintes variáveis: {'{nome_paciente}'}, {'{data}'}, {'{hora}'}, {'{nome_médico}'}, {'{especialidade}'}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button>Salvar modelo</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* New Tab for Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <WebhookSettings />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
