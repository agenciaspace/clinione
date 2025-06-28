import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export const NotificationsSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notificações</h2>
        <p className="text-gray-500">Configure suas preferências de notificação</p>
      </div>

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
              <h4 className="text-sm font-medium">Relatórios financeiros</h4>
              <p className="text-sm text-muted-foreground">
                Receba relatórios mensais sobre o desempenho da clínica
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações push</CardTitle>
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
            <Switch defaultChecked />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Cancelamentos</h4>
              <p className="text-sm text-muted-foreground">
                Receba notificações sobre cancelamentos de consultas
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Mensagens de pacientes</h4>
              <p className="text-sm text-muted-foreground">
                Seja notificado sobre novas mensagens dos pacientes
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de horário</CardTitle>
          <CardDescription>Defina quando receber notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário de início</Label>
              <Select defaultValue="08:00">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="06:00">06:00</SelectItem>
                  <SelectItem value="07:00">07:00</SelectItem>
                  <SelectItem value="08:00">08:00</SelectItem>
                  <SelectItem value="09:00">09:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Horário de término</Label>
              <Select defaultValue="18:00">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="17:00">17:00</SelectItem>
                  <SelectItem value="18:00">18:00</SelectItem>
                  <SelectItem value="19:00">19:00</SelectItem>
                  <SelectItem value="20:00">20:00</SelectItem>
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
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 