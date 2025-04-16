
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';
import { WebhookEventType, triggerWebhook } from '@/utils/webhook-service';
import { Loader2, AlertCircle, CheckCircle2, RefreshCw, Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WebhookEvent {
  id: string;
  event_type: string;
  status: string;
  timestamp: string;
  last_attempt: string | null;
  http_status: number | null;
  last_response: string | null;
  attempts: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
};

const WebhookSettings: React.FC = () => {
  const { activeClinic, refreshClinics } = useClinic();
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [webhookSecret, setWebhookSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [testEventType, setTestEventType] = useState<string>(WebhookEventType.APPOINTMENT_CREATED);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  // Load webhook settings for the active clinic
  useEffect(() => {
    if (!activeClinic) return;
    
    const loadWebhookSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('webhook_url, webhook_secret')
          .eq('id', activeClinic.id)
          .single();

        if (error) throw error;
        
        setWebhookUrl(data.webhook_url || '');
        setWebhookSecret(data.webhook_secret || '');
      } catch (error) {
        console.error('Error loading webhook settings:', error);
        toast.error('Erro ao carregar configurações de webhook');
      } finally {
        setIsLoading(false);
      }
    };

    loadWebhookSettings();
    loadWebhookEvents();
  }, [activeClinic]);

  // Load webhook events
  const loadWebhookEvents = async () => {
    if (!activeClinic) return;
    
    setIsLoadingEvents(true);
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('clinic_id', activeClinic.id)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setWebhookEvents(data || []);
    } catch (error) {
      console.error('Error loading webhook events:', error);
      toast.error('Erro ao carregar eventos de webhook');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Save webhook settings
  const saveWebhookSettings = async () => {
    if (!activeClinic) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('clinics')
        .update({
          webhook_url: webhookUrl.trim() || null,
          webhook_secret: webhookSecret.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeClinic.id);

      if (error) throw error;
      
      toast.success('Configurações de webhook salvas com sucesso');
      refreshClinics();
    } catch (error) {
      console.error('Error saving webhook settings:', error);
      toast.error('Erro ao salvar configurações de webhook');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate random webhook secret
  const generateSecret = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const secret = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setWebhookSecret(secret);
  };

  // Send test webhook
  const sendTestWebhook = async () => {
    if (!activeClinic || !webhookUrl) {
      toast.error('Configure uma URL de webhook primeiro');
      return;
    }
    
    setIsSendingTest(true);
    try {
      // Example payload based on event type
      let testPayload = {};
      
      if (testEventType.startsWith('appointment.')) {
        testPayload = {
          id: 'test-id',
          date: new Date().toISOString(),
          patient_name: 'Paciente Teste',
          doctor_name: 'Dr. Teste',
          status: 'scheduled',
          type: 'in-person'
        };
      } else if (testEventType.startsWith('patient.')) {
        testPayload = {
          id: 'test-id',
          name: 'Paciente Teste',
          email: 'teste@exemplo.com',
          phone: '11999999999',
          birthDate: '1990-01-01'
        };
      } else if (testEventType.startsWith('doctor.')) {
        testPayload = {
          id: 'test-id',
          name: 'Dr. Teste',
          speciality: 'Clínico Geral',
          email: 'dr.teste@exemplo.com'
        };
      } else if (testEventType.startsWith('clinic.')) {
        testPayload = {
          id: activeClinic.id,
          name: activeClinic.name,
          address: activeClinic.address,
          phone: activeClinic.phone,
          email: activeClinic.email
        };
      } else if (testEventType.startsWith('transaction.')) {
        testPayload = {
          id: 'test-id',
          amount: 100.0,
          description: 'Transação Teste',
          type: 'income',
          status: 'completed',
          date: new Date().toISOString()
        };
      }
      
      const { success, message, eventId } = await triggerWebhook(
        testEventType as WebhookEventType,
        testPayload,
        activeClinic.id
      );

      if (success) {
        toast.success('Webhook de teste enviado com sucesso', {
          description: `ID do evento: ${eventId}`
        });
        
        // Reload events after a short delay to see the new event
        setTimeout(() => {
          loadWebhookEvents();
        }, 1000);
      } else {
        toast.error(`Erro ao enviar webhook de teste: ${message}`);
      }
    } catch (error) {
      console.error('Error sending test webhook:', error);
      toast.error('Erro ao enviar webhook de teste');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  // Format status badge
  const getStatusBadge = (status: string) => {
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
    return <Badge className={colorClass}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Webhook</CardTitle>
          <CardDescription>Integre sua clínica com sistemas externos através de webhooks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL do Webhook</Label>
              <Input
                id="webhook-url"
                placeholder="https://sua-api.com/webhooks"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={isSaving}
              />
              <p className="text-sm text-gray-500">
                Todos os eventos da clínica serão enviados para esta URL como requisições POST.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="webhook-secret">Token Secreto</Label>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={generateSecret}
                  disabled={isSaving}
                >
                  Gerar
                </Button>
              </div>
              <div className="flex">
                <Input
                  id="webhook-secret"
                  type={showSecret ? "text" : "password"}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  disabled={isSaving}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="ml-2"
                >
                  {showSecret ? "Esconder" : "Mostrar"}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Este token será enviado no header <code>X-Webhook-Secret</code> para autenticação.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                onClick={saveWebhookSettings}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : 'Salvar Configurações'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {webhookUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Testar Webhook</CardTitle>
            <CardDescription>Envie um evento de teste para verificar sua integração</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-event-type">Tipo de Evento</Label>
                <Select
                  value={testEventType}
                  onValueChange={setTestEventType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WebhookEventType.APPOINTMENT_CREATED}>
                      Agendamento Criado
                    </SelectItem>
                    <SelectItem value={WebhookEventType.APPOINTMENT_UPDATED}>
                      Agendamento Atualizado
                    </SelectItem>
                    <SelectItem value={WebhookEventType.APPOINTMENT_STATUS_CHANGED}>
                      Status de Agendamento Alterado
                    </SelectItem>
                    <SelectItem value={WebhookEventType.PATIENT_CREATED}>
                      Paciente Criado
                    </SelectItem>
                    <SelectItem value={WebhookEventType.DOCTOR_CREATED}>
                      Médico Criado
                    </SelectItem>
                    <SelectItem value={WebhookEventType.CLINIC_UPDATED}>
                      Clínica Atualizada
                    </SelectItem>
                    <SelectItem value={WebhookEventType.TRANSACTION_CREATED}>
                      Transação Criada
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={sendTestWebhook}
                  disabled={isSendingTest}
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Webhook de Teste
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Log de Eventos</CardTitle>
            <CardDescription>Últimos eventos de webhook enviados</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadWebhookEvents}
            disabled={isLoadingEvents}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingEvents ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingEvents ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : webhookEvents.length > 0 ? (
            <div className="space-y-4">
              {webhookEvents.map((event) => (
                <div key={event.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{event.event_type}</div>
                      <div className="text-sm text-gray-500">
                        {formatTimestamp(event.timestamp)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(event.status)}
                      {event.http_status && (
                        <Badge variant="outline">HTTP {event.http_status}</Badge>
                      )}
                    </div>
                  </div>
                  
                  {event.last_attempt && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Última tentativa:</span>{' '}
                      {formatTimestamp(event.last_attempt)}
                      {event.attempts > 1 && (
                        <span className="ml-2 text-gray-500">
                          ({event.attempts} tentativas)
                        </span>
                      )}
                    </div>
                  )}
                  
                  {event.last_response && (
                    <div className="mt-2">
                      <Separator className="my-2" />
                      <div className="text-sm font-medium">Resposta:</div>
                      <div className="p-2 bg-gray-50 rounded mt-1 text-xs font-mono overflow-auto max-h-24">
                        {event.last_response}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum evento de webhook encontrado</p>
              {!webhookUrl && (
                <p className="text-sm text-gray-400 mt-1">
                  Configure uma URL de webhook para começar a enviar eventos
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookSettings;
