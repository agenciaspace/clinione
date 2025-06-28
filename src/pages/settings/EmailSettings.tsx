import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from 'lucide-react';

export const EmailSettings = () => {
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '587',
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    secure: false
  });

  const handleSmtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSmtpConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSmtpConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Save SMTP configuration to your database
      // Example: await supabase.from('smtp_config').upsert({ ...smtpConfig, user_id: user.id });
      
      toast.success('Configurações SMTP salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar configurações SMTP:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestLoading(true);
    try {
      // Send test email using current SMTP config
      // Example API call to test SMTP connection
      
      toast.success('Email de teste enviado com sucesso');
    } catch (error) {
      console.error('Erro ao testar SMTP:', error);
      toast.error('Erro ao enviar email de teste');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Email</h2>
        <p className="text-gray-500">Configure seu servidor de email SMTP</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Configuração SMTP
            <Badge variant="outline" className="ml-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              Não configurado
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
                <Label htmlFor="fromEmail">Email do remetente</Label>
                <Input 
                  id="fromEmail" 
                  name="fromEmail" 
                  type="email" 
                  placeholder="noreply@suaclinica.com" 
                  value={smtpConfig.fromEmail} 
                  onChange={handleSmtpChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromName">Nome do remetente</Label>
                <Input 
                  id="fromName" 
                  name="fromName" 
                  placeholder="Sua Clínica" 
                  value={smtpConfig.fromName} 
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

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Salvar configurações'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTestSmtp}
                disabled={testLoading || !smtpConfig.host}
                className="flex-1"
              >
                {testLoading ? 'Testando...' : 'Testar configuração'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates de email</CardTitle>
          <CardDescription>Personalize os templates dos emails automáticos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Confirmação de agendamento</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Email enviado quando uma consulta é agendada
              </p>
              <Button variant="outline" size="sm">Editar template</Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Lembrete de consulta</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Email enviado 24h antes da consulta
              </p>
              <Button variant="outline" size="sm">Editar template</Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Cancelamento</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Email enviado quando uma consulta é cancelada
              </p>
              <Button variant="outline" size="sm">Editar template</Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Reagendamento</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Email enviado quando uma consulta é reagendada
              </p>
              <Button variant="outline" size="sm">Editar template</Button>
            </div>
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
    </div>
  );
}; 