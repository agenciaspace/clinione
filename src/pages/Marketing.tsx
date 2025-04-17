
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsListWithMobileSupport, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Mail, 
  Share2, 
  BarChart,
  Users,
  Bell,
  Send,
  Plus,
  Calendar,
  ChevronRight,
  FileBarChart,
  AlertCircle,
  Loader2,
  CheckCircle,
  Instagram,
  Facebook,
  Twitter,
  ArrowUpRight
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { Textarea } from '@/components/ui/textarea';

interface MarketingCampaign {
  id: string;
  name: string;
  status: 'active' | 'scheduled' | 'completed';
  type: 'email' | 'sms';
  sent: number;
  opened: number;
  clicked: number;
  date: string;
  clinic_id: string;
}

interface MarketingStats {
  newPatients: number;
  websiteVisits: number;
  conversions: number;
  socialFollowers: number;
}

interface SmtpConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
}

const Marketing = () => {
  const { activeClinic } = useClinic();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>([]);
  const [marketingStats, setMarketingStats] = useState<MarketingStats>({
    newPatients: 0,
    websiteVisits: 0,
    conversions: 0,
    socialFollowers: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'email',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    content: ''
  });
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig | null>(null);
  const [isSmtpLoading, setIsSmtpLoading] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (activeClinic) {
      fetchCampaigns();
      fetchMarketingStats();
      fetchSmtpConfig();
    } else {
      setMarketingCampaigns([]);
      setMarketingStats({
        newPatients: 0,
        websiteVisits: 0,
        conversions: 0,
        socialFollowers: 0
      });
      setSmtpConfig(null);
    }
  }, [activeClinic]);

  const fetchSmtpConfig = async () => {
    if (!activeClinic) return;
    
    setIsSmtpLoading(true);
    try {
      // Simulating API call for SMTP config
      setTimeout(() => {
        setSmtpConfig({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: '********',
          fromEmail: 'noreply@clinica.com',
          fromName: 'Clínica',
          secure: true
        });
        setIsSmtpLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao carregar configurações SMTP:', error);
      toast.error('Não foi possível carregar as configurações SMTP');
      setIsSmtpLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    if (!activeClinic) return;
    
    setIsLoading(true);
    try {
      // Simulating API call for campaigns
      setTimeout(() => {
        // Mock data for demonstration
        const mockCampaigns = [
          {
            id: '1',
            name: 'Promoção de Verão',
            status: 'active' as const,
            type: 'email' as const,
            sent: 150,
            opened: 85,
            clicked: 42,
            date: '2025-01-15',
            clinic_id: activeClinic.id
          },
          {
            id: '2',
            name: 'Recall de Pacientes',
            status: 'scheduled' as const,
            type: 'sms' as const,
            sent: 0,
            opened: 0,
            clicked: 0,
            date: '2025-05-10',
            clinic_id: activeClinic.id
          },
          {
            id: '3',
            name: 'Newsletter Mensal',
            status: 'completed' as const,
            type: 'email' as const,
            sent: 300,
            opened: 210,
            clicked: 75,
            date: '2024-12-01',
            clinic_id: activeClinic.id
          }
        ];
        setMarketingCampaigns(mockCampaigns);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      toast.error('Não foi possível carregar as campanhas de marketing');
      setIsLoading(false);
    }
  };

  const fetchMarketingStats = async () => {
    if (!activeClinic) return;
    
    try {
      // Simulating API call for marketing stats
      setTimeout(() => {
        setMarketingStats({
          newPatients: 42,
          websiteVisits: 1250,
          conversions: 18,
          socialFollowers: 345
        });
      }, 700);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Não foi possível carregar estatísticas de marketing');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaignForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeClinic) {
      toast.error('Selecione uma clínica para criar uma campanha');
      return;
    }
    
    if (!smtpConfig && campaignForm.type === 'email') {
      toast.error('Configure as configurações SMTP antes de criar uma campanha de email');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulating API call for creating campaign
      setTimeout(() => {
        // Create a new campaign and add it to the list
        const newCampaign: MarketingCampaign = {
          id: `new-${Date.now()}`,
          name: campaignForm.name,
          type: campaignForm.type as 'email' | 'sms',
          status: 'scheduled',
          sent: 0,
          opened: 0,
          clicked: 0,
          date: campaignForm.date,
          clinic_id: activeClinic.id
        };
        
        setMarketingCampaigns(prev => [newCampaign, ...prev]);
        toast.success('Campanha criada com sucesso!');
        setIsDialogOpen(false);
        setIsLoading(false);
        
        setCampaignForm({
          name: '',
          type: 'email',
          date: new Date().toISOString().split('T')[0],
          subject: '',
          content: ''
        });
      }, 1000);
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      toast.error('Não foi possível criar a campanha');
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testEmailAddress) {
      toast.error('Informe um endereço de email para o teste');
      return;
    }
    
    if (!smtpConfig) {
      toast.error('As configurações SMTP não estão disponíveis');
      return;
    }
    
    setIsSendingTest(true);
    try {
      // Simulating API call for sending test email
      setTimeout(() => {
        toast.success(`Email de teste enviado com sucesso para ${testEmailAddress}`);
        setShowTestEmailDialog(false);
        setTestEmailAddress('');
        setIsSendingTest(false);
      }, 1500);
    } catch (error) {
      console.error('Erro ao enviar email de teste:', error);
      toast.error('Falha ao enviar email de teste');
      setIsSendingTest(false);
    }
  };

  const handleActivateAutomation = (id: string) => {
    toast.success('Automação ativada com sucesso!');
    // Here you would update the state or make an API call to update the automation status
  };

  const handleDeactivateAutomation = (id: string) => {
    toast.success('Automação desativada com sucesso!');
    // Here you would update the state or make an API call to update the automation status
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta campanha?')) {
      setMarketingCampaigns(prev => prev.filter(campaign => campaign.id !== id));
      toast.success('Campanha excluída com sucesso!');
    }
  };

  const handleConnectSocial = (platform: string) => {
    toast.success(`Conectando ao ${platform}...`);
    // Here you would redirect to OAuth flow or show a dialog to connect the social account
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="text-gray-500">
          {activeClinic
            ? `Gerencie as campanhas de marketing da clínica ${activeClinic.name}`
            : 'Selecione uma clínica para gerenciar campanhas de marketing'}
        </p>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsListWithMobileSupport className="grid w-full grid-cols-1 md:grid-cols-4" showScrollButtons={isMobile}>
          <TabsTrigger value="campaigns" className="flex items-center justify-center">
            <Mail className="mr-2 h-4 w-4" />
            <span className={isMobile && activeTab !== 'campaigns' ? "sr-only" : ""}>Campanhas</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center justify-center">
            <Bell className="mr-2 h-4 w-4" />
            <span className={isMobile && activeTab !== 'automation' ? "sr-only" : ""}>Automação</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center justify-center">
            <BarChart className="mr-2 h-4 w-4" />
            <span className={isMobile && activeTab !== 'analytics' ? "sr-only" : ""}>Análises</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center justify-center">
            <Share2 className="mr-2 h-4 w-4" />
            <span className={isMobile && activeTab !== 'social' ? "sr-only" : ""}>Redes Sociais</span>
          </TabsTrigger>
        </TabsListWithMobileSupport>

        {activeClinic ? (
          <>
            <TabsContent value="campaigns" className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold">Campanhas de Marketing</h2>
                <div className="flex space-x-2">
                  <Dialog open={showTestEmailDialog} onOpenChange={setShowTestEmailDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Send className="mr-2 h-4 w-4" /> Testar Email
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enviar Email de Teste</DialogTitle>
                        <DialogDescription>
                          Envie um email de teste para verificar suas configurações SMTP.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSendTestEmail}>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="testEmail">Endereço de Email</Label>
                            <Input 
                              id="testEmail"
                              type="email"
                              placeholder="seu.email@exemplo.com" 
                              value={testEmailAddress}
                              onChange={(e) => setTestEmailAddress(e.target.value)}
                              required
                            />
                          </div>
                          
                          {isSmtpLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                              <span className="ml-2 text-gray-500">Carregando configurações SMTP...</span>
                            </div>
                          ) : smtpConfig ? (
                            <div className="space-y-2">
                              <div className="p-3 bg-green-50 rounded-md flex items-center text-green-700">
                                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                Configurações SMTP disponíveis
                              </div>
                              <div className="text-sm text-gray-500">
                                <p><strong>Servidor:</strong> {smtpConfig.host}</p>
                                <p><strong>De:</strong> {smtpConfig.fromEmail}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-yellow-50 rounded-md flex items-center text-yellow-700">
                              <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                              Configurações SMTP não encontradas. Por favor, configure nas Configurações.
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowTestEmailDialog(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isSendingTest || !smtpConfig || isSmtpLoading}
                          >
                            {isSendingTest ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              'Enviar Teste'
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nova campanha
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Criar Nova Campanha</DialogTitle>
                        <DialogDescription>
                          Preencha os detalhes da nova campanha de marketing.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateCampaign}>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Nome da Campanha</Label>
                              <Input 
                                id="name" 
                                name="name" 
                                value={campaignForm.name} 
                                onChange={handleFormChange} 
                                required 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="type">Tipo</Label>
                              <select 
                                id="type" 
                                name="type" 
                                value={campaignForm.type} 
                                onChange={handleFormChange}
                                className="w-full p-2 border rounded"
                              >
                                <option value="email">Email</option>
                                <option value="sms">SMS</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="date">Data de Envio</Label>
                              <Input 
                                id="date" 
                                name="date" 
                                type="date" 
                                value={campaignForm.date} 
                                onChange={handleFormChange} 
                                required 
                              />
                            </div>
                            {campaignForm.type === 'email' && (
                              <div className="space-y-2">
                                <Label htmlFor="subject">Assunto do Email</Label>
                                <Input 
                                  id="subject" 
                                  name="subject" 
                                  value={campaignForm.subject} 
                                  onChange={handleFormChange} 
                                  required 
                                />
                              </div>
                            )}
                          </div>
                          
                          {campaignForm.type === 'email' && (
                            <div className="space-y-2">
                              <Label htmlFor="content">Conteúdo</Label>
                              <Textarea 
                                id="content" 
                                name="content" 
                                value={campaignForm.content} 
                                onChange={handleFormChange} 
                                required 
                                className="min-h-[150px]" 
                              />
                              <p className="text-xs text-gray-500">
                                Você pode usar variáveis como {'{nome}'}, {'{data}'}, etc.
                              </p>
                            </div>
                          )}
                          
                          {campaignForm.type === 'email' && !smtpConfig && (
                            <div className="p-3 bg-yellow-50 rounded-md flex items-center text-yellow-700">
                              <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                              Configurações SMTP não encontradas. Por favor, configure nas Configurações.
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isLoading || (campaignForm.type === 'email' && !smtpConfig)}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando...
                              </>
                            ) : (
                              'Criar Campanha'
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Desempenho</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : marketingCampaigns.length > 0 ? (
                        marketingCampaigns.map(campaign => (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell>
                              {campaign.type === 'email' ? (
                                <span className="inline-flex items-center">
                                  <Mail className="h-4 w-4 mr-1" /> Email
                                </span>
                              ) : (
                                <span className="inline-flex items-center">
                                  <MessageSquare className="h-4 w-4 mr-1" /> SMS
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  campaign.status === 'active' 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                    : campaign.status === 'scheduled' 
                                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                }>
                                {campaign.status === 'active' 
                                  ? 'Ativa' 
                                  : campaign.status === 'scheduled' 
                                    ? 'Agendada' 
                                    : 'Concluída'}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(campaign.date).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>
                              {campaign.status !== 'scheduled' ? (
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Taxa de abertura</span>
                                    <span>{Math.round((campaign.opened / campaign.sent) * 100)}%</span>
                                  </div>
                                  <Progress value={(campaign.opened / campaign.sent) * 100} className="h-2" />
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Ainda não enviada</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  Detalhes <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteCampaign(campaign.id)}>
                                  Excluir
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                            Nenhuma campanha encontrada. Crie sua primeira campanha usando o botão acima.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total de campanhas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{marketingCampaigns.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Emails enviados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {marketingCampaigns.reduce((sum, campaign) => sum + campaign.sent, 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Taxa média de abertura</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {marketingCampaigns.length > 0 && marketingCampaigns.reduce((sum, campaign) => sum + campaign.sent, 0) > 0 ? 
                        Math.round(
                          (marketingCampaigns.reduce((sum, campaign) => sum + campaign.opened, 0) /
                          marketingCampaigns.reduce((sum, campaign) => sum + campaign.sent, 0)) * 100
                        ) : 0}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Taxa média de cliques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {marketingCampaigns.length > 0 && marketingCampaigns.reduce((sum, campaign) => sum + campaign.sent, 0) > 0 ? 
                        Math.round(
                          (marketingCampaigns.reduce((sum, campaign) => sum + campaign.clicked, 0) /
                          marketingCampaigns.reduce((sum, campaign) => sum + campaign.sent, 0)) * 100
                        ) : 0}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automação de Marketing</CardTitle>
                  <CardDescription>
                    Configure mensagens automáticas para seus pacientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Lembrete de consulta</h3>
                            <p className="text-sm text-gray-500">Envio 24h antes da consulta</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">Ativo</Badge>
                          <Button variant="ghost" size="sm" onClick={() => handleDeactivateAutomation('reminder')}>Desativar</Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-full mr-3">
                            <Bell className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Aniversário</h3>
                            <p className="text-sm text-gray-500">Mensagem de felicitação</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">Ativo</Badge>
                          <Button variant="ghost" size="sm" onClick={() => handleDeactivateAutomation('birthday')}>Desativar</Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-purple-100 p-2 rounded-full mr-3">
                            <Users className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Retorno</h3>
                            <p className="text-sm text-gray-500">90 dias após última consulta</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">Inativo</Badge>
                          <Button variant="ghost" size="sm" onClick={() => handleActivateAutomation('return')}>Ativar</Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-orange-100 p-2 rounded-full mr-3">
                            <Send className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Feedback</h3>
                            <p className="text-sm text-gray-500">Após cada consulta</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">Ativo</Badge>
                          <Button variant="ghost" size="sm" onClick={() => handleDeactivateAutomation('feedback')}>Desativar</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Criar nova automação
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Novos pacientes</p>
                        <h3 className="text-2xl font-bold mt-1">{marketingStats.newPatients}</h3>
                      </div>
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-4">
                      +12% em relação ao mês anterior
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Visitas ao site</p>
                        <h3 className="text-2xl font-bold mt-1">{marketingStats.websiteVisits}</h3>
                      </div>
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Share2 className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-4">
                      +8% em relação ao mês anterior
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Conversões</p>
                        <h3 className="text-2xl font-bold mt-1">{marketingStats.conversions}</h3>
                      </div>
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-xs text-purple-600 mt-4">
                      +5% em relação ao mês anterior
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Seguidores</p>
                        <h3 className="text-2xl font-bold mt-1">{marketingStats.socialFollowers}</h3>
                      </div>
                      <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Share2 className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <p className="text-xs text-orange-600 mt-4">
                      +20% em relação ao mês anterior
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho de marketing</CardTitle>
                  <CardDescription>Análise dos últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                    <div className="text-center">
                      <BarChart className="h-16 w-16 mx-auto text-gray-300" />
                      <p className="text-sm text-gray-500 mt-2">Conecte suas fontes de dados para visualizar estatísticas</p>
                      <Button className="mt-4" variant="outline">Configurar integração</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociais</CardTitle>
                  <CardDescription>Gerencie a presença da clínica nas redes sociais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Instagram className="mr-2 h-5 w-5" /> Instagram
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm text-gray-500">
                          {activeClinic.socialMedia?.instagram ? (
                            <>
                              @{activeClinic.socialMedia.instagram}
                              <br />
                              <span className="text-gray-400">Conecte para ver estatísticas</span>
                            </>
                          ) : (
                            'Conta não conectada'
                          )}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => handleConnectSocial('Instagram')}>
                          {activeClinic.socialMedia?.instagram ? 'Gerenciar' : 'Conectar conta'}
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Facebook className="mr-2 h-5 w-5" /> Facebook
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm text-gray-500">
                          {activeClinic.socialMedia?.facebook ? (
                            <>
                              {activeClinic.name}
                              <br />
                              <span className="text-gray-400">Conecte para ver estatísticas</span>
                            </>
                          ) : (
                            'Conta não conectada'
                          )}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => handleConnectSocial('Facebook')}>
                          {activeClinic.socialMedia?.facebook ? 'Gerenciar' : 'Conectar conta'}
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Twitter className="mr-2 h-5 w-5" /> Twitter
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm text-gray-500">
                          {activeClinic.socialMedia?.twitter ? (
                            <>
                              @{activeClinic.socialMedia.twitter}
                              <br />
                              <span className="text-gray-400">Conecte para ver estatísticas</span>
                            </>
                          ) : (
                            'Conta não conectada'
                          )}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => handleConnectSocial('Twitter')}>
                          {activeClinic.socialMedia?.twitter ? 'Gerenciar' : 'Conectar conta'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Calendário de publicações</CardTitle>
                  <CardDescription>Planeje e agende publicações para suas redes sociais</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">Nenhuma publicação agendada</h3>
                  <p className="text-gray-500 max-w-md mt-2">
                    Você ainda não tem publicações agendadas. Clique no botão abaixo para criar sua primeira publicação.
                  </p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" /> Nova publicação
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Links Úteis</CardTitle>
                  <CardDescription>Recursos para melhorar sua presença nas redes sociais</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Guia de marketing para clínicas</span>
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Templates para Instagram</span>
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Ideias de conteúdo para saúde</span>
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : (
          <Card className="mt-4">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Nenhuma clínica selecionada</h3>
              <p className="text-gray-500 mt-2">
                Selecione uma clínica para gerenciar as campanhas de marketing.
              </p>
            </CardContent>
          </Card>
        )}
      </Tabs>
    </DashboardLayout>
  );
};

export default Marketing;
