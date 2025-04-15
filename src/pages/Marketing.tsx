
import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Plus, 
  Users, 
  CalendarClock,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Calendar,
  BarChart4,
  ImageIcon,
  FileEdit,
  Trash2,
  Search,
  Filter,
  Bell
} from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/components/ui/sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Dados mockados para exemplo
const mockCampaigns = [
  {
    id: '1',
    name: 'Promoção de Primavera',
    type: 'email',
    status: 'active',
    target: 'Todos os pacientes',
    sentTo: 240,
    openRate: 45,
    clickRate: 12,
    scheduledDate: new Date(2025, 3, 20)
  },
  {
    id: '2',
    name: 'Lembrete de Consulta',
    type: 'sms',
    status: 'active',
    target: 'Pacientes com agendamento',
    sentTo: 85,
    openRate: 95,
    clickRate: 0,
    scheduledDate: new Date(2025, 3, 15)
  },
  {
    id: '3',
    name: 'Atualização de Serviços',
    type: 'email',
    status: 'scheduled',
    target: 'Pacientes antigos',
    sentTo: 0,
    openRate: 0,
    clickRate: 0,
    scheduledDate: new Date(2025, 4, 5)
  },
  {
    id: '4',
    name: 'Dia da Saúde',
    type: 'social',
    status: 'draft',
    target: 'Redes sociais',
    sentTo: 0,
    openRate: 0,
    clickRate: 0,
    scheduledDate: null
  }
];

const mockAnalytics = [
  { month: 'Jan', emails: 120, sms: 50, social: 30 },
  { month: 'Fev', emails: 150, sms: 60, social: 45 },
  { month: 'Mar', emails: 180, sms: 70, social: 60 },
  { month: 'Abr', emails: 220, sms: 85, social: 75 }
];

const mockTemplates = [
  {
    id: '1',
    name: 'Boas-vindas',
    type: 'email',
    lastUsed: new Date(2025, 3, 10)
  },
  {
    id: '2',
    name: 'Aniversário',
    type: 'email',
    lastUsed: new Date(2025, 3, 5)
  },
  {
    id: '3',
    name: 'Confirmação de Consulta',
    type: 'sms',
    lastUsed: new Date(2025, 3, 12)
  },
  {
    id: '4',
    name: 'Lembrete de Consulta',
    type: 'sms',
    lastUsed: new Date(2025, 3, 14)
  }
];

interface CampaignFormData {
  id?: string;
  name: string;
  type: 'email' | 'sms' | 'social';
  target: string;
  content: string;
  scheduledDate: Date | null;
}

const Marketing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [templates, setTemplates] = useState(mockTemplates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    type: 'email',
    target: '',
    content: '',
    scheduledDate: null
  });

  // Filtrar campanhas
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddCampaign = () => {
    setFormData({
      name: '',
      type: 'email',
      target: '',
      content: '',
      scheduledDate: null
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCampaign = {
      id: `${Date.now()}`,
      name: formData.name,
      type: formData.type,
      status: formData.scheduledDate ? 'scheduled' : 'draft',
      target: formData.target,
      sentTo: 0,
      openRate: 0,
      clickRate: 0,
      scheduledDate: formData.scheduledDate
    };
    
    setCampaigns([newCampaign, ...campaigns]);
    toast("Campanha criada com sucesso");
    setIsDialogOpen(false);
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(campaign => campaign.id !== id));
    toast("Campanha excluída com sucesso");
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="text-gray-500">Gerencie as campanhas de marketing da sua clínica</p>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="campaigns" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" /> Campanhas
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <FileEdit className="h-4 w-4 mr-2" /> Modelos
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart4 className="h-4 w-4 mr-2" /> Análise
          </TabsTrigger>
        </TabsList>

        {/* Tab de Campanhas */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAddCampaign}>
              <Plus className="mr-2 h-4 w-4" /> Nova campanha
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campanhas de Marketing</CardTitle>
              <CardDescription>Gerencie suas campanhas de email, SMS e redes sociais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Público-alvo</TableHead>
                      <TableHead>Data programada</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.length > 0 ? (
                      filteredCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell>
                            {campaign.type === 'email' && <Mail className="h-4 w-4 inline mr-1" />}
                            {campaign.type === 'sms' && <MessageSquare className="h-4 w-4 inline mr-1" />}
                            {campaign.type === 'social' && <Instagram className="h-4 w-4 inline mr-1" />}
                            {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={campaign.status === 'active' ? 'default' : campaign.status === 'scheduled' ? 'outline' : 'secondary'}>
                              {campaign.status === 'active' && 'Ativo'}
                              {campaign.status === 'scheduled' && 'Agendado'}
                              {campaign.status === 'draft' && 'Rascunho'}
                            </Badge>
                          </TableCell>
                          <TableCell>{campaign.target}</TableCell>
                          <TableCell>
                            {campaign.scheduledDate 
                              ? format(campaign.scheduledDate, "dd 'de' MMMM", { locale: ptBR }) 
                              : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="icon">
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteCampaign(campaign.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Nenhuma campanha encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Campanhas de Email</CardTitle>
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.filter(c => c.type === 'email').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxa de abertura média: 42%
                </p>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Novo email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Campanhas de SMS</CardTitle>
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.filter(c => c.type === 'sms').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxa de entrega: 98%
                </p>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Novo SMS
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Redes Sociais</CardTitle>
                  <Instagram className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.filter(c => c.type === 'social').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Alcance médio: 520 pessoas
                </p>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Nova publicação
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Campanhas</CardTitle>
              <CardDescription>Campanhas programadas para os próximos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns
                  .filter(c => c.status === 'scheduled' && c.scheduledDate)
                  .sort((a, b) => a.scheduledDate && b.scheduledDate ? a.scheduledDate.getTime() - b.scheduledDate.getTime() : 0)
                  .slice(0, 3)
                  .map(campaign => (
                    <div key={campaign.id} className="flex items-start space-x-4 border-b pb-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center
                        ${campaign.type === 'email' ? 'bg-blue-100 text-blue-600' : ''}
                        ${campaign.type === 'sms' ? 'bg-green-100 text-green-600' : ''}
                        ${campaign.type === 'social' ? 'bg-purple-100 text-purple-600' : ''}
                      `}>
                        {campaign.type === 'email' && <Mail className="h-5 w-5" />}
                        {campaign.type === 'sms' && <MessageSquare className="h-5 w-5" />}
                        {campaign.type === 'social' && <Instagram className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <Badge variant="outline">{campaign.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{campaign.target}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {campaign.scheduledDate && format(campaign.scheduledDate, "dd/MM/yyyy")}
                        </div>
                      </div>
                    </div>
                  ))}

                {campaigns.filter(c => c.status === 'scheduled' && c.scheduledDate).length === 0 && (
                  <div className="text-center py-4">
                    <CalendarClock className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Nenhuma campanha agendada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Templates */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar modelos..."
                className="pl-10"
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo modelo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <Card key={template.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-32 bg-gray-100 flex items-center justify-center border-b">
                    {template.type === 'email' ? (
                      <Mail className="h-12 w-12 text-gray-400" />
                    ) : (
                      <MessageSquare className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{template.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline">{template.type}</Badge>
                      <span className="text-xs text-gray-500">
                        Última utilização: {format(template.lastUsed, "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">Editar</Button>
                      <Button size="sm" className="flex-1">Usar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed overflow-hidden">
              <CardContent className="p-0 h-full">
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <Plus className="h-12 w-12 text-gray-400 mb-2" />
                  <h3 className="font-medium text-gray-700">Adicionar modelo</h3>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    Crie um modelo personalizado para suas campanhas
                  </p>
                  <Button className="mt-4" variant="outline">Criar modelo</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold">Desempenho de Marketing</h2>
            <Select defaultValue="month">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total de Emails</p>
                    <h3 className="text-2xl font-bold">670</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Mail className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-green-600">↑ 24% em relação ao período anterior</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total de SMS</p>
                    <h3 className="text-2xl font-bold">265</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-green-600">↑ 12% em relação ao período anterior</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Público atingido</p>
                    <h3 className="text-2xl font-bold">2.450</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-green-600">↑ 18% em relação ao período anterior</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Canal</CardTitle>
              <CardDescription>Campanhas enviadas por canal ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockAnalytics}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="emails" name="Emails" fill="#3b82f6" />
                    <Bar dataKey="sms" name="SMS" fill="#22c55e" />
                    <Bar dataKey="social" name="Redes Sociais" fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conexões de Redes Sociais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      <Facebook className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Facebook</h4>
                      <p className="text-sm text-gray-500">1.250 seguidores</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Desconectar</Button>
                </div>

                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mr-3">
                      <Instagram className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Instagram</h4>
                      <p className="text-sm text-gray-500">3.450 seguidores</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Desconectar</Button>
                </div>

                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                      <Twitter className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Twitter</h4>
                      <p className="text-sm text-gray-500">840 seguidores</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Conectar</Button>
                </div>

                <div className="p-4 border border-dashed rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mr-3">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Adicionar nova rede</h4>
                      <p className="text-sm text-gray-500">Conecte mais canais</p>
                    </div>
                  </div>
                  <Button size="sm">Adicionar</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campanhas mais efetivas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 pb-4 border-b">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Promoção de Primavera</h4>
                      <p className="text-sm text-gray-500">Enviado para 240 pacientes</p>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Abertura</p>
                          <p className="text-sm font-medium">45%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cliques</p>
                          <p className="text-sm font-medium">12%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Conversões</p>
                          <p className="text-sm font-medium">8%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 pb-4 border-b">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Lembrete de Consulta</h4>
                      <p className="text-sm text-gray-500">Enviado para 85 pacientes</p>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Abertura</p>
                          <p className="text-sm font-medium">95%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cliques</p>
                          <p className="text-sm font-medium">0%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Conversões</p>
                          <p className="text-sm font-medium">92%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" className="w-full">
                    Ver relatório completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Campanha</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da campanha</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: string) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="social">Redes Sociais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Público-alvo</Label>
                <Select 
                  value={formData.target} 
                  onValueChange={(value) => handleSelectChange('target', value)}
                >
                  <SelectTrigger id="target">
                    <SelectValue placeholder="Selecione o público-alvo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos os pacientes">Todos os pacientes</SelectItem>
                    <SelectItem value="Pacientes novos">Pacientes novos</SelectItem>
                    <SelectItem value="Pacientes antigos">Pacientes antigos</SelectItem>
                    <SelectItem value="Pacientes com agendamento">Pacientes com agendamento</SelectItem>
                    <SelectItem value="Redes sociais">Redes sociais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Template básico</SelectItem>
                      <SelectItem value="promotion">Promoção</SelectItem>
                      <SelectItem value="reminder">Lembrete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.type !== 'sms' && (
                  <div className="space-y-2">
                    <Label>Imagem</Label>
                    <div className="flex items-center justify-center border border-dashed rounded-md h-10">
                      <Button variant="ghost" size="sm" className="h-full w-full flex items-center">
                        <ImageIcon className="h-4 w-4 mr-2" /> Carregar imagem
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Agendar envio?</Label>
                  <Button variant="outline" size="sm" type="button">
                    <Calendar className="h-4 w-4 mr-2" /> Selecionar data
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {formData.scheduledDate 
                    ? `Agendado para ${format(formData.scheduledDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}` 
                    : 'Será salvo como rascunho'}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Criar campanha
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Marketing;
