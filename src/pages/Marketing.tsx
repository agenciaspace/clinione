
import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Mail, 
  Share2, 
  FileBar, 
  BarChart,
  Users,
  Bell,
  Send,
  Plus,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/contexts/ClinicContext';

// Dados mockados para campanhas de marketing
const marketingCampaigns = [
  {
    id: '1',
    name: 'Campanha de Prevenção',
    status: 'active',
    type: 'email',
    sent: 345,
    opened: 220,
    clicked: 98,
    date: '2025-04-01'
  },
  {
    id: '2',
    name: 'Promoção de Aniversário',
    status: 'scheduled',
    type: 'sms',
    sent: 0,
    opened: 0,
    clicked: 0,
    date: '2025-04-20'
  },
  {
    id: '3',
    name: 'Dicas de Saúde',
    status: 'completed',
    type: 'email',
    sent: 512,
    opened: 387,
    clicked: 156,
    date: '2025-03-15'
  }
];

// Dados mockados para análises de marketing
const marketingStats = {
  newPatients: 42,
  websiteVisits: 2345,
  conversions: 18,
  socialFollowers: 987
};

const Marketing = () => {
  const { activeClinic } = useClinic();
  const [activeTab, setActiveTab] = useState('campaigns');

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
        <TabsList>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="social">Redes Sociais</TabsTrigger>
        </TabsList>

        {activeClinic ? (
          <>
            <TabsContent value="campaigns" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Campanhas de Marketing</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Nova campanha
                </Button>
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
                      {marketingCampaigns.map(campaign => (
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
                            <Button variant="ghost" size="sm">
                              Detalhes <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                      {Math.round(
                        (marketingCampaigns.reduce((sum, campaign) => sum + campaign.opened, 0) /
                        marketingCampaigns.reduce((sum, campaign) => sum + campaign.sent, 0)) * 100
                      )}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Taxa média de cliques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(
                        (marketingCampaigns.reduce((sum, campaign) => sum + campaign.clicked, 0) /
                        marketingCampaigns.reduce((sum, campaign) => sum + campaign.sent, 0)) * 100
                      )}%
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
                          <Button variant="ghost" size="sm">Editar</Button>
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
                          <Button variant="ghost" size="sm">Editar</Button>
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
                          <Button variant="ghost" size="sm">Editar</Button>
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
                          <Button variant="ghost" size="sm">Editar</Button>
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
                      +15% em relação ao mês anterior
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
                      +12% em relação ao mês anterior
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
                      +22% em relação ao mês anterior
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
                      <p className="text-sm text-gray-500 mt-2">Gráfico de desempenho de marketing</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Instagram</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm text-gray-500">
                          {activeClinic.socialMedia?.instagram ? (
                            <>
                              @{activeClinic.socialMedia.instagram}
                              <br />
                              <span className="text-gray-400">450 seguidores</span>
                            </>
                          ) : (
                            'Conta não conectada'
                          )}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">
                          {activeClinic.socialMedia?.instagram ? 'Gerenciar' : 'Conectar conta'}
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Facebook</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm text-gray-500">
                          {activeClinic.socialMedia?.facebook ? (
                            <>
                              {activeClinic.name}
                              <br />
                              <span className="text-gray-400">320 curtidas</span>
                            </>
                          ) : (
                            'Conta não conectada'
                          )}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">
                          {activeClinic.socialMedia?.facebook ? 'Gerenciar' : 'Conectar conta'}
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
