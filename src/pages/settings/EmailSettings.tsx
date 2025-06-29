import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Mail, Send, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { NotificationService, SMTPConfig } from '@/utils/notification-service';
import { EmailTemplateEditor } from '@/components/settings/EmailTemplateEditor';

export const EmailSettings = () => {
  const { user } = useAuth();
  const { activeClinic } = useClinic();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  
  // Template editor state
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    type: string;
    title: string;
    description: string;
  } | null>(null);
  
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({
    clinic_id: activeClinic?.id || '',
    host: '',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    from_name: '',
    secure: true,
    is_active: true
  });

  useEffect(() => {
    if (activeClinic) {
      loadSmtpConfig();
    }
  }, [activeClinic]);

  const loadSmtpConfig = async () => {
    if (!activeClinic) return;

    try {
      const config = await NotificationService.getSmtpConfig(activeClinic.id);
      if (config) {
        setSmtpConfig(config);
        setSmtpConfigured(true);
      }
    } catch (error) {
      console.error('Error loading SMTP config:', error);
    }
  };

  const handleSmtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSmtpConfig(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || 587 : value
    }));
  };

  const handleSaveSmtpConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClinic) return;

    setLoading(true);
    
    try {
      const configToSave = {
        ...smtpConfig,
        clinic_id: activeClinic.id
      };

      await NotificationService.saveSmtpConfig(configToSave);
      setSmtpConfigured(true);
      toast.success('Configurações SMTP salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar configurações SMTP:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!activeClinic) return;

    setTestLoading(true);
    try {
      const success = await NotificationService.testSmtpConfig(smtpConfig);
      if (success) {
        toast.success('Email de teste enviado com sucesso! Verifique sua caixa de entrada.');
      } else {
        toast.error('Erro ao enviar email de teste. Verifique as configurações.');
      }
    } catch (error) {
      console.error('Erro ao testar SMTP:', error);
      toast.error('Erro ao enviar email de teste');
    } finally {
      setTestLoading(false);
    }
  };

  const handleEditTemplate = (type: string, title: string, description: string) => {
    setSelectedTemplate({ type, title, description });
    setTemplateEditorOpen(true);
  };

  const handleCloseTemplateEditor = () => {
    setTemplateEditorOpen(false);
    setSelectedTemplate(null);
  };

  const emailTemplates = [
    {
      type: 'appointment_confirmation',
      title: 'Confirmação de agendamento',
      description: 'Email enviado quando uma consulta é agendada'
    },
    {
      type: 'appointment_reminder',
      title: 'Lembrete de consulta',
      description: 'Email enviado 24h antes da consulta'
    },
    {
      type: 'appointment_cancellation',
      title: 'Cancelamento',
      description: 'Email enviado quando uma consulta é cancelada'
    },
    {
      type: 'appointment_reschedule',
      title: 'Reagendamento',
      description: 'Email enviado quando uma consulta é reagendada'
    }
  ];

  if (!activeClinic) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email</h2>
          <p className="text-gray-500">Selecione uma clínica para configurar o email</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Email</h2>
        <p className="text-gray-500">Configure seu servidor de email SMTP</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração SMTP
            <Badge variant={smtpConfigured ? "default" : "outline"} className="ml-2">
              {smtpConfigured ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Configurado
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Não configurado
                </>
              )}
            </Badge>
          </CardTitle>
          <CardDescription>
            Configure seu servidor SMTP para envio de emails automáticos
          </CardDescription>
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
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Porta</Label>
                <Input 
                  id="port" 
                  name="port" 
                  type="number"
                  placeholder="587" 
                  value={smtpConfig.port} 
                  onChange={handleSmtpChange} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input 
                  id="username" 
                  name="username" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={smtpConfig.username} 
                  onChange={handleSmtpChange} 
                  required 
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
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_email">Email do remetente</Label>
                <Input 
                  id="from_email" 
                  name="from_email" 
                  type="email" 
                  placeholder="noreply@suaclinica.com" 
                  value={smtpConfig.from_email} 
                  onChange={handleSmtpChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from_name">Nome do remetente</Label>
                <Input 
                  id="from_name" 
                  name="from_name" 
                  placeholder="Sua Clínica" 
                  value={smtpConfig.from_name} 
                  onChange={handleSmtpChange} 
                  required 
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="secure" 
                checked={smtpConfig.secure}
                onCheckedChange={(checked) => setSmtpConfig({...smtpConfig, secure: checked})}
              />
              <Label htmlFor="secure">Usar conexão segura (TLS/SSL)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="is_active" 
                checked={smtpConfig.is_active}
                onCheckedChange={(checked) => setSmtpConfig({...smtpConfig, is_active: checked})}
              />
              <Label htmlFor="is_active">Ativar envio de emails</Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Salvar configurações'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTestSmtp}
                disabled={testLoading || !smtpConfig.host || !smtpConfigured}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {testLoading ? 'Testando...' : 'Testar configuração'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Templates de email
          </CardTitle>
          <CardDescription>Personalize os templates dos emails automáticos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailTemplates.map((template) => (
              <div key={template.type} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{template.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>
                <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template.type, template.title, template.description)}>Editar template</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações avançadas</CardTitle>
          <CardDescription>Opções adicionais para envio de emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Enviar cópia para administrador</h4>
              <p className="text-sm text-muted-foreground">
                Receber cópia de todos os emails enviados automaticamente
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Limite de envios por hora</h4>
              <p className="text-sm text-muted-foreground">
                Limitar quantidade de emails enviados por hora
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Input type="number" defaultValue="100" className="w-20" />
              <span className="text-sm">emails/hora</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Retry automático</h4>
              <p className="text-sm text-muted-foreground">
                Tentar reenviar emails que falharam automaticamente
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Template Editor Modal */}
      {selectedTemplate && (
        <EmailTemplateEditor
          isOpen={templateEditorOpen}
          onClose={handleCloseTemplateEditor}
          templateType={selectedTemplate.type}
          templateTitle={selectedTemplate.title}
          templateDescription={selectedTemplate.description}
        />
      )}
    </div>
  );
}; 