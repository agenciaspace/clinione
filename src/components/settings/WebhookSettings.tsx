
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';
import { WebhookEventType, triggerWebhook, loadWebhookLogs, WebhookLogResponse } from '@/utils/webhook-service';
import { Loader2, AlertCircle, CheckCircle2, RefreshCw, Send, Plus, Trash2, Code, Copy, Pencil, Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

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

interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string | null;
  description: string | null;
  is_active: boolean;
  event_types: string[] | null;
  created_at: string;
}

interface WebhookLog {
  id: string;
  event_id: string;
  webhook_id: string | null;
  clinic_id: string;
  status: string;
  response_code: number | null;
  response_body: string | null;
  retry_count: number;
  next_retry_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  sending: 'bg-blue-100 text-blue-800'
};

const WebhookSettings: React.FC = () => {
  const { activeClinic, refreshClinics } = useClinic();
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [webhookSecret, setWebhookSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [webhookEndpoints, setWebhookEndpoints] = useState<WebhookEndpoint[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [isLoadingEndpoints, setIsLoadingEndpoints] = useState<boolean>(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [testEventType, setTestEventType] = useState<string>(WebhookEventType.APPOINTMENT_CREATED);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('legacy');
  
  const [isEndpointDialogOpen, setIsEndpointDialogOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<WebhookEndpoint | null>(null);
  const [newEndpointUrl, setNewEndpointUrl] = useState('');
  const [newEndpointSecret, setNewEndpointSecret] = useState('');
  const [newEndpointDescription, setNewEndpointDescription] = useState('');
  const [newEndpointEvents, setNewEndpointEvents] = useState<Record<string, boolean>>({});
  const [showEndpointSecret, setShowEndpointSecret] = useState(false);

  const fetchWebhookLogs = async () => {
    if (!activeClinic) return;
    
    setIsLoadingLogs(true);
    try {
      const result = await loadWebhookLogs(activeClinic.id, activeTab);
      
      if (result.error) throw result.error;
      setWebhookLogs(result.data || []);
    } catch (error) {
      console.error('Error loading webhook logs:', error);
      toast.error('Erro ao carregar logs de webhook');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const loadWebhookSettings = async () => {
    setIsLoading(true);
    try {
      if (!activeClinic) return;
      
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

  useEffect(() => {
    if (!activeClinic) return;
    
    loadWebhookSettings();
    loadWebhookEvents();
    loadWebhookEndpoints();
    fetchWebhookLogs();
  }, [activeClinic]);

  const loadWebhookEndpoints = async () => {
    if (!activeClinic) return;
    
    setIsLoadingEndpoints(true);
    try {
      const { data, error } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('clinic_id', activeClinic.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setWebhookEndpoints(data || []);
    } catch (error) {
      console.error('Error loading webhook endpoints:', error);
      toast.error('Erro ao carregar endpoints de webhook');
    } finally {
      setIsLoadingEndpoints(false);
    }
  };

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

  const generateSecret = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const secret = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setWebhookSecret(secret);
  };

  const generateEndpointSecret = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const secret = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setNewEndpointSecret(secret);
  };

  const sendTestWebhook = async () => {
    if (!activeClinic) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }
    
    if (activeTab === 'legacy' && !webhookUrl) {
      toast.error('Configure uma URL de webhook primeiro');
      return;
    }
    
    if (activeTab !== 'legacy' && !webhookEndpoints.find(ep => ep.id === activeTab)?.url) {
      toast.error('Endpoint não encontrado ou sem URL configurada');
      return;
    }
    
    setIsSendingTest(true);
    try {
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
        
        setTimeout(() => {
          loadWebhookEvents();
          fetchWebhookLogs();
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

  const saveWebhookEndpoint = async () => {
    if (!activeClinic) return;
    
    if (!newEndpointUrl.trim()) {
      toast.error('URL é obrigatória');
      return;
    }
    
    setIsSaving(true);
    try {
      const selectedEvents = Object.entries(newEndpointEvents)
        .filter(([_, isSelected]) => isSelected)
        .map(([eventType]) => eventType);
      
      const eventTypes = selectedEvents.length > 0 ? selectedEvents : null;
      
      if (editingEndpoint) {
        const { error } = await supabase
          .from('webhook_endpoints')
          .update({
            url: newEndpointUrl.trim(),
            secret: newEndpointSecret.trim() || null,
            description: newEndpointDescription.trim() || null,
            event_types: eventTypes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEndpoint.id);

        if (error) throw error;
        
        toast.success('Endpoint de webhook atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('webhook_endpoints')
          .insert({
            clinic_id: activeClinic.id,
            url: newEndpointUrl.trim(),
            secret: newEndpointSecret.trim() || null,
            description: newEndpointDescription.trim() || null,
            event_types: eventTypes,
            is_active: true
          });

        if (error) throw error;
        
        toast.success('Endpoint de webhook criado com sucesso');
      }
      
      loadWebhookEndpoints();
      resetEndpointForm();
      setIsEndpointDialogOpen(false);
    } catch (error) {
      console.error('Error saving webhook endpoint:', error);
      toast.error('Erro ao salvar endpoint de webhook');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteWebhookEndpoint = async (endpointId: string) => {
    if (!confirm('Tem certeza que deseja excluir este endpoint?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('webhook_endpoints')
        .delete()
        .eq('id', endpointId);

      if (error) throw error;
      
      toast.success('Endpoint removido com sucesso');
      loadWebhookEndpoints();
      
      if (activeTab === endpointId) {
        setActiveTab('legacy');
      }
    } catch (error) {
      console.error('Error deleting webhook endpoint:', error);
      toast.error('Erro ao remover endpoint de webhook');
    }
  };

  const toggleEndpointStatus = async (endpoint: WebhookEndpoint) => {
    try {
      const { error } = await supabase
        .from('webhook_endpoints')
        .update({
          is_active: !endpoint.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', endpoint.id);

      if (error) throw error;
      
      toast.success(`Endpoint ${endpoint.is_active ? 'desativado' : 'ativado'} com sucesso`);
      loadWebhookEndpoints();
    } catch (error) {
      console.error('Error toggling endpoint status:', error);
      toast.error('Erro ao alterar status do endpoint');
    }
  };

  const openEditEndpoint = (endpoint: WebhookEndpoint) => {
    setEditingEndpoint(endpoint);
    setNewEndpointUrl(endpoint.url);
    setNewEndpointSecret(endpoint.secret || '');
    setNewEndpointDescription(endpoint.description || '');
    
    const eventTypesObj: Record<string, boolean> = {};
    if (endpoint.event_types) {
      Object.values(WebhookEventType).forEach(eventType => {
        eventTypesObj[eventType] = endpoint.event_types!.includes(eventType);
      });
    }
    setNewEndpointEvents(eventTypesObj);
    
    setIsEndpointDialogOpen(true);
  };

  const resetEndpointForm = () => {
    setEditingEndpoint(null);
    setNewEndpointUrl('');
    setNewEndpointSecret('');
    setNewEndpointDescription('');
    setNewEndpointEvents({});
    setShowEndpointSecret(false);
  };

  const openNewEndpoint = () => {
    resetEndpointForm();
    setIsEndpointDialogOpen(true);
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
    return <Badge className={colorClass}>{status}</Badge>;
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setTimeout(() => {
      fetchWebhookLogs();
    }, 100);
  };

  const getEndpointName = (endpointId: string | null) => {
    if (!endpointId || endpointId === 'legacy') {
      return 'Webhook Padrão';
    }
    
    const endpoint = webhookEndpoints.find(ep => ep.id === endpointId);
    return endpoint?.description || `Endpoint ${endpoint?.id.substring(0, 8)}`;
  };

  const handleRefreshData = () => {
    loadWebhookEvents();
    fetchWebhookLogs();
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
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="legacy">Webhook Padrão</TabsTrigger>
            {webhookEndpoints.map(endpoint => (
              <TabsTrigger key={endpoint.id} value={endpoint.id} className="flex items-center space-x-1">
                <span>{endpoint.description || `Endpoint ${endpoint.id.substring(0, 8)}`}</span>
                {!endpoint.is_active && <Badge variant="outline" className="ml-1 bg-gray-100">Inativo</Badge>}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <Button variant="outline" onClick={openNewEndpoint}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Endpoint
          </Button>
        </div>

        <TabsContent value="legacy">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhook Padrão</CardTitle>
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
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Este token será usado para assinar o payload do webhook com HMAC SHA-256 e enviado no header <code>X-Hub-Signature</code>.
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
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Testar Webhook Padrão</CardTitle>
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
        </TabsContent>

        {webhookEndpoints.map(endpoint => (
          <TabsContent key={endpoint.id} value={endpoint.id}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{endpoint.description || 'Webhook Endpoint'}</CardTitle>
                    <CardDescription>{endpoint.url}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleEndpointStatus(endpoint)}
                    >
                      {endpoint.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditEndpoint(endpoint)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteWebhookEndpoint(endpoint.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {!endpoint.is_active && (
                  <Badge variant="outline" className="bg-gray-100">Inativo</Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoint.event_types && endpoint.event_types.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Eventos filtrados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {endpoint.event_types.map(eventType => (
                          <Badge key={eventType} variant="secondary">{eventType}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Este endpoint recebe todos os tipos de evento.
                    </p>
                  )}

                  <div className="pt-4">
                    <Button
                      onClick={() => {
                        setTestEventType(WebhookEventType.APPOINTMENT_CREATED);
                        sendTestWebhook();
                      }}
                      disabled={isSendingTest || !endpoint.is_active}
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
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Log de Eventos</CardTitle>
            <CardDescription>Últimos eventos de webhook enviados</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isLoadingEvents || isLoadingLogs}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingEvents || isLoadingLogs ? 'animate-spin' : ''}`} />
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
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">{event.event_type}</div>
                        <Badge variant="outline" className="bg-gray-50">ID: evt_{event.id.substring(0, 8)}</Badge>
                      </div>
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
              {activeTab === 'legacy' && !webhookUrl && (
                <p className="text-sm text-gray-400 mt-1">
                  Configure uma URL de webhook para começar a enviar eventos
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {activeTab !== 'legacy' && (
        <Card>
          <CardHeader>
            <CardTitle>Log de Entregas</CardTitle>
            <CardDescription>Histórico de entregas para este endpoint de webhook</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLogs ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : webhookLogs.length > 0 ? (
              <div className="space-y-4">
                {webhookLogs.map((log) => (
                  <div key={log.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm">Evento: <span className="font-mono">{log.event_id.substring(0, 8)}</span></div>
                        <div className="text-sm text-gray-500">{formatTimestamp(log.created_at)}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(log.status)}
                        {log.response_code && (
                          <Badge variant="outline">HTTP {log.response_code}</Badge>
                        )}
                      </div>
                    </div>
                    
                    {log.retry_count > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Tentativas:</span>{' '}
                        {log.retry_count}
                        {log.next_retry_at && (
                          <span className="ml-2 text-gray-500">
                            (Próxima: {formatTimestamp(log.next_retry_at)})
                          </span>
                        )}
                      </div>
                    )}
                    
                    {log.response_body && (
                      <div className="mt-2">
                        <Separator className="my-2" />
                        <div className="text-sm font-medium">Resposta:</div>
                        <div className="p-2 bg-gray-50 rounded mt-1 text-xs font-mono overflow-auto max-h-24">
                          {log.response_body}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhum log de entrega encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isEndpointDialogOpen} onOpenChange={setIsEndpointDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEndpoint ? 'Editar Endpoint' : 'Novo Endpoint'}</DialogTitle>
            <DialogDescription>
              Configure um endpoint personalizado para receber webhooks.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint-url">URL do Endpoint</Label>
              <Input
                id="endpoint-url"
                placeholder="https://sua-api.com/webhooks"
                value={newEndpointUrl}
                onChange={(e) => setNewEndpointUrl(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endpoint-description">Descrição (opcional)</Label>
              <Input
                id="endpoint-description"
                placeholder="API de integração"
                value={newEndpointDescription}
                onChange={(e) => setNewEndpointDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="endpoint-secret">Token Secreto (opcional)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={generateEndpointSecret}
                >
                  Gerar
                </Button>
              </div>
              <div className="flex">
                <Input
                  id="endpoint-secret"
                  type={showEndpointSecret ? "text" : "password"}
                  value={newEndpointSecret}
                  onChange={(e) => setNewEndpointSecret(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowEndpointSecret(!showEndpointSecret)}
                  className="ml-2"
                >
                  {showEndpointSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="block mb-2">Filtrar Eventos (opcional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.values(WebhookEventType).map(eventType => (
                  <div key={eventType} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`event-${eventType}`} 
                      checked={newEndpointEvents[eventType] || false}
                      onCheckedChange={(checked) => {
                        setNewEndpointEvents(prev => ({
                          ...prev,
                          [eventType]: !!checked
                        }));
                      }}
                    />
                    <Label 
                      htmlFor={`event-${eventType}`}
                      className="text-sm cursor-pointer"
                    >
                      {eventType}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEndpointDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveWebhookEndpoint} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : editingEndpoint ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebhookSettings;
