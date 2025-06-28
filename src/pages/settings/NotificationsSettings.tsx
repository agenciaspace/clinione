import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Mail, Bell, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { NotificationService, NotificationPreferences } from '@/utils/notification-service';

export const NotificationsSettings = () => {
  const { user } = useAuth();
  const { activeClinic } = useClinic();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    clinic_id: activeClinic?.id || '',
    user_id: user?.id || '',
    appointment_confirmations: true,
    appointment_reminders: true,
    appointment_cancellations: true,
    appointment_reschedules: true,
    system_updates: false,
    financial_reports: true,
    push_new_appointments: true,
    push_cancellations: true,
    push_patient_messages: false,
    quiet_hours_start: '18:00',
    quiet_hours_end: '08:00',
    weekend_quiet: true
  });

  useEffect(() => {
    if (activeClinic && user) {
      loadNotificationPreferences();
    }
  }, [activeClinic, user]);

  const loadNotificationPreferences = async () => {
    if (!activeClinic || !user) return;

    try {
      const userPreferences = await NotificationService.getNotificationPreferences(
        activeClinic.id,
        user.id
      );
      
      if (userPreferences) {
        setPreferences(userPreferences);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const handleSavePreferences = async () => {
    if (!activeClinic || !user) return;

    setLoading(true);
    try {
      const preferencesToSave = {
        ...preferences,
        clinic_id: activeClinic.id,
        user_id: user.id
      };

      await NotificationService.saveNotificationPreferences(preferencesToSave);
      toast.success('Preferências de notificação salvas com sucesso');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Erro ao salvar preferências');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!activeClinic || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notificações</h2>
          <p className="text-gray-500">Selecione uma clínica para configurar as notificações</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notificações</h2>
        <p className="text-gray-500">Configure suas preferências de notificação</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notificações por email
          </CardTitle>
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
            <Switch 
              checked={preferences.appointment_confirmations}
              onCheckedChange={(checked) => updatePreference('appointment_confirmations', checked)}
            />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Lembretes de consulta</h4>
              <p className="text-sm text-muted-foreground">
                Receba lembretes antes das consultas agendadas
              </p>
            </div>
            <Switch 
              checked={preferences.appointment_reminders}
              onCheckedChange={(checked) => updatePreference('appointment_reminders', checked)}
            />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Cancelamentos de consulta</h4>
              <p className="text-sm text-muted-foreground">
                Receba notificações quando consultas forem canceladas
              </p>
            </div>
            <Switch 
              checked={preferences.appointment_cancellations}
              onCheckedChange={(checked) => updatePreference('appointment_cancellations', checked)}
            />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Reagendamentos</h4>
              <p className="text-sm text-muted-foreground">
                Receba notificações quando consultas forem reagendadas
              </p>
            </div>
            <Switch 
              checked={preferences.appointment_reschedules}
              onCheckedChange={(checked) => updatePreference('appointment_reschedules', checked)}
            />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Atualizações do sistema</h4>
              <p className="text-sm text-muted-foreground">
                Receba atualizações sobre novidades e melhorias
              </p>
            </div>
            <Switch 
              checked={preferences.system_updates}
              onCheckedChange={(checked) => updatePreference('system_updates', checked)}
            />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Relatórios financeiros</h4>
              <p className="text-sm text-muted-foreground">
                Receba relatórios mensais sobre o desempenho da clínica
              </p>
            </div>
            <Switch 
              checked={preferences.financial_reports}
              onCheckedChange={(checked) => updatePreference('financial_reports', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações push
          </CardTitle>
          <CardDescription>Configure notificações em tempo real</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Novos agendamentos</h4>
              <p className="text-sm text-muted-foreground">
                Seja notificado imediatamente sobre novos agendamentos
              </p>
            </div>
            <Switch 
              checked={preferences.push_new_appointments}
              onCheckedChange={(checked) => updatePreference('push_new_appointments', checked)}
            />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Cancelamentos</h4>
              <p className="text-sm text-muted-foreground">
                Receba notificações sobre cancelamentos de consultas
              </p>
            </div>
            <Switch 
              checked={preferences.push_cancellations}
              onCheckedChange={(checked) => updatePreference('push_cancellations', checked)}
            />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Mensagens de pacientes</h4>
              <p className="text-sm text-muted-foreground">
                Seja notificado sobre novas mensagens dos pacientes
              </p>
            </div>
            <Switch 
              checked={preferences.push_patient_messages}
              onCheckedChange={(checked) => updatePreference('push_patient_messages', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configurações de horário
          </CardTitle>
          <CardDescription>Defina quando receber notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário de início (modo silencioso)</Label>
              <Select 
                value={preferences.quiet_hours_start} 
                onValueChange={(value) => updatePreference('quiet_hours_start', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="17:00">17:00</SelectItem>
                  <SelectItem value="18:00">18:00</SelectItem>
                  <SelectItem value="19:00">19:00</SelectItem>
                  <SelectItem value="20:00">20:00</SelectItem>
                  <SelectItem value="21:00">21:00</SelectItem>
                  <SelectItem value="22:00">22:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Horário de término (modo silencioso)</Label>
              <Select 
                value={preferences.quiet_hours_end} 
                onValueChange={(value) => updatePreference('quiet_hours_end', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="06:00">06:00</SelectItem>
                  <SelectItem value="07:00">07:00</SelectItem>
                  <SelectItem value="08:00">08:00</SelectItem>
                  <SelectItem value="09:00">09:00</SelectItem>
                  <SelectItem value="10:00">10:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Não perturbe nos fins de semana</h4>
              <p className="text-sm text-muted-foreground">
                Pausar notificações não urgentes aos sábados e domingos
              </p>
            </div>
            <Switch 
              checked={preferences.weekend_quiet}
              onCheckedChange={(checked) => updatePreference('weekend_quiet', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </div>
    </div>
  );
}; 