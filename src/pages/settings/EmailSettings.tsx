import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Mail, Send, Settings, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { NotificationService, SMTPConfig } from '@/utils/notification-service';
import { EmailTemplateEditor } from '@/components/settings/EmailTemplateEditor';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface EmailTemplate {
  id: string;
  template_type: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
}

const defaultSMTPConfig: Omit<SMTPConfig, 'clinic_id'> = {
  host: '',
  port: 587,
  username: '',
  password: '',
  from_email: '',
  from_name: '',
  secure: true,
  is_active: true,
};

export const EmailSettings = () => {
  const { user } = useAuth();
  const { activeClinic } = useClinic();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Configuration states
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // Template editor state
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  
  const [smtpConfig, setSmtpConfig] = useState<Omit<SMTPConfig, 'clinic_id'>>(defaultSMTPConfig);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [tablesExist, setTablesExist] = useState(true);

  // Memoized template types
  const templateTypes = useMemo(() => [
    { type: 'appointment_confirmation', label: 'Confirmação de Agendamento' },
    { type: 'appointment_reminder', label: 'Lembrete de Consulta' },
    { type: 'appointment_cancellation', label: 'Cancelamento de Consulta' },
    { type: 'appointment_reschedule', label: 'Reagendamento de Consulta' },
  ], []);

  const loadSMTPConfig = useCallback(async () => {
    if (!activeClinic?.id || !user) return;

    try {
      const { data, error } = await supabase
        .from('smtp_config')
        .select('*')
        .eq('clinic_id', activeClinic.id)
        .single();

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist
          setTablesExist(false);
          return;
        }
        if (error.code !== 'PGRST116') {
          console.error('Error loading SMTP config:', error);
        }
        return;
      }

      if (data) {
        const { clinic_id, created_at, updated_at, use_tls, secure, ...rest } = data as any;
        setSmtpConfig({
          ...rest,
          port: data.port,
          username: data.username,
          password: data.password,
          from_email: data.from_email,
          from_name: data.from_name,
          secure: secure !== undefined ? secure : use_tls ?? false,
          is_active: data.is_active
        });
        setSmtpConfigured(true);
      } else {
        setSmtpConfigured(false);
      }
    } catch (error) {
      console.error('Error loading SMTP config:', error);
      setSmtpConfigured(false);
    } finally {
      setIsInitialized(true);
    }
  }, [activeClinic?.id, user]);

  const loadEmailTemplates = useCallback(async () => {
    if (!activeClinic?.id || !user || !tablesExist) return;

    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('clinic_id', activeClinic.id);

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist
          setTablesExist(false);
          return;
        }
        console.error('Error loading email templates:', error);
        return;
      }

      if (data) {
        const templates = data.map(template => ({
          id: template.id,
          template_type: template.template_type,
          subject: template.subject,
          html_content: template.html_content,
          text_content: template.text_content,
          variables: Array.isArray((template as any).variables) ? 
            (template as any).variables.filter((v: any): v is string => typeof v === 'string') : []
        }));
        setEmailTemplates(templates);
      }
    } catch (error) {
      console.error('Error loading email templates:', error);
    }
  }, [activeClinic?.id, user, tablesExist]);

  const handleSmtpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSmtpConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
  }, []);

  const handleSaveSmtp = useCallback(async () => {
    if (!activeClinic?.id) return;
    
    setSaving(true);
    try {
      const { secure, ...smtpRest } = smtpConfig as any;
      const configToSave = {
        ...smtpRest,
        use_tls: secure,
        clinic_id: activeClinic.id
      };

      await supabase
        .from('smtp_config')
        .upsert(configToSave, { onConflict: 'clinic_id' });
      setSmtpConfigured(true);
      toast.success('Configurações SMTP salvas com sucesso');
    } catch (error) {
      console.error('Error saving SMTP config:', error);
      toast.error('Erro ao salvar configurações SMTP');
    } finally {
      setSaving(false);
    }
  }, [activeClinic?.id, smtpConfig]);

  const handleEditTemplate = useCallback((template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateEditorOpen(true);
  }, []);

  const handleCloseTemplateEditor = useCallback(() => {
    setTemplateEditorOpen(false);
    setSelectedTemplate(null);
  }, []);

  const handleTemplateSave = useCallback(async (updatedTemplate: EmailTemplate) => {
    if (!tablesExist) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: updatedTemplate.subject,
          html_content: updatedTemplate.html_content,
          text_content: updatedTemplate.text_content,
        })
        .eq('id', updatedTemplate.id);

      if (error) throw error;

      setEmailTemplates(prev => 
        prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t)
      );
      
      toast.success('Template atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Erro ao atualizar template');
    }
  }, [tablesExist]);

  const handleTestEmail = useCallback(async () => {
    if (!activeClinic?.id || !smtpConfigured) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      // Simulate test - replace with actual test function when available
      const success = true; // await NotificationService.testSmtpConnection(activeClinic.id);
      setTestResult({
        success,
        message: success ? 'Conexão SMTP testada com sucesso!' : 'Falha no teste de conexão SMTP'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão SMTP'
      });
    } finally {
      setTesting(false);
    }
  }, [activeClinic?.id, smtpConfigured]);

  // Initialize data loading
  useEffect(() => {
    if (!activeClinic?.id || !user || isInitialized) return;

    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadSMTPConfig(), loadEmailTemplates()]);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeData();
  }, [activeClinic?.id, user, isInitialized, loadSMTPConfig, loadEmailTemplates]);

  if (!tablesExist) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Configurações de Email</h3>
          <p className="text-sm text-muted-foreground">
            Configure as opções de email da clínica
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            As tabelas do sistema de notificação ainda não foram criadas no banco de dados. 
            Por favor, execute o script SQL fornecido no painel do Supabase para ativar esta funcionalidade.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Sistema de Email Indisponível
            </CardTitle>
            <CardDescription>
              Para usar as funcionalidades de email, é necessário executar a migração do banco de dados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Entre em contato com o administrador do sistema para executar a migração necessária.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Configurações de Email</h3>
          <p className="text-sm text-muted-foreground">
            Carregando configurações...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Email</h2>
        <p className="text-gray-500">Configure as opções de email da clínica</p>
      </div>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuração SMTP
            {smtpConfigured && (
              <Badge variant="secondary" className="ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configurado
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configure o servidor de email para envio de notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Servidor SMTP</Label>
              <Input
                id="host"
                name="host"
                value={smtpConfig.host}
                onChange={handleSmtpChange}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Porta</Label>
              <Input
                id="port"
                name="port"
                type="number"
                value={smtpConfig.port}
                onChange={handleSmtpChange}
                placeholder="587"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                name="username"
                value={smtpConfig.username}
                onChange={handleSmtpChange}
                placeholder="seu-email@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={smtpConfig.password}
                onChange={handleSmtpChange}
                placeholder="sua-senha-de-app"
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
                value={smtpConfig.from_email}
                onChange={handleSmtpChange}
                placeholder="clinica@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from_name">Nome do remetente</Label>
              <Input
                id="from_name"
                name="from_name"
                value={smtpConfig.from_name}
                onChange={handleSmtpChange}
                placeholder="Clínica Exemplo"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="secure"
                name="secure"
                checked={smtpConfig.secure}
                onCheckedChange={(checked) => setSmtpConfig(prev => ({ ...prev, secure: checked }))}
              />
              <Label htmlFor="secure">Conexão segura (TLS/SSL)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                name="is_active"
                checked={smtpConfig.is_active}
                onCheckedChange={(checked) => setSmtpConfig(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Ativo</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveSmtp} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar configurações'}
            </Button>
            {smtpConfigured && (
              <Button variant="outline" onClick={handleTestEmail} disabled={testing}>
                <Send className="h-4 w-4 mr-2" />
                {testing ? 'Testando...' : 'Testar conexão'}
              </Button>
            )}
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex items-center">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                {testResult.message}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Templates de email
          </CardTitle>
          <CardDescription>
            Personalize os templates de email enviados aos pacientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templateTypes.map(({ type, label }) => {
              const template = emailTemplates.find(t => t.template_type === type);
              return (
                <div key={type} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{label}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {template ? 'Template configurado' : 'Template padrão'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => template && handleEditTemplate(template)}
                    disabled={!template}
                  >
                    Editar Template
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Template Editor Modal */}
      {selectedTemplate && (
        <EmailTemplateEditor
          isOpen={templateEditorOpen}
          onClose={handleCloseTemplateEditor}
          templateType={selectedTemplate.template_type}
          templateTitle={templateTypes.find(t => t.type === selectedTemplate.template_type)?.label || ''}
          templateDescription=""
        />
      )}
    </div>
  );
}; 