
import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Calendar, 
  MoreVertical, 
  FileText, 
  Trash2, 
  Edit
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';

// Dados mockados para exemplo
const mockPatients = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria.silva@exemplo.com',
    phone: '(11) 99999-8888',
    birthDate: '1985-05-20',
    lastVisit: '2023-12-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao.santos@exemplo.com',
    phone: '(11) 98765-4321',
    birthDate: '1990-03-15',
    lastVisit: '2024-02-10',
    status: 'active'
  },
  {
    id: '3',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@exemplo.com',
    phone: '(11) 91234-5678',
    birthDate: '1978-11-08',
    lastVisit: '2024-01-07',
    status: 'inactive'
  },
  {
    id: '4',
    name: 'Carlos Pereira',
    email: 'carlos.pereira@exemplo.com',
    phone: '(11) 92345-6789',
    birthDate: '1972-07-22',
    lastVisit: '2023-11-30',
    status: 'active'
  },
  {
    id: '5',
    name: 'Fernanda Costa',
    email: 'fernanda.costa@exemplo.com',
    phone: '(11) 93456-7890',
    birthDate: '1995-09-14',
    lastVisit: '2024-03-05',
    status: 'active'
  }
];

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  
  // Filtrar pacientes com base na pesquisa
  const filteredPatients = mockPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );
  
  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para adicionar um paciente (simulação)
    setIsAddPatientOpen(false);
    
    toast("Paciente adicionado", {
      description: "O novo paciente foi cadastrado com sucesso."
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
        <p className="text-gray-500">Gerencie o cadastro de pacientes</p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="inactive">Inativos</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar paciente..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Paciente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Adicionar novo paciente</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do paciente para cadastrá-lo no sistema.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPatient}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nome completo</Label>
                          <Input id="name" placeholder="Nome do paciente" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="email@exemplo.com" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input id="phone" placeholder="(00) 00000-0000" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="birthdate">Data de nascimento</Label>
                          <Input id="birthdate" type="date" required />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddPatientOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Cadastrar Paciente</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <TabsContent value="all">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="hidden lg:table-cell">Nascimento</TableHead>
                      <TableHead className="hidden lg:table-cell">Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                          Nenhum paciente encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-500 md:hidden">{patient.email}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{patient.email}</TableCell>
                          <TableCell>{patient.phone}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {format(new Date(patient.birthDate), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant={patient.status === 'active' ? 'default' : 'outline'} className={patient.status === 'active' ? 'bg-healthgreen-600' : ''}>
                              {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Abrir menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>Agendar consulta</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Ver prontuário</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="active">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="hidden lg:table-cell">Nascimento</TableHead>
                      <TableHead className="hidden lg:table-cell">Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients
                      .filter(patient => patient.status === 'active')
                      .map((patient) => (
                        // Conteúdo similar ao anterior, apenas filtrado
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-500 md:hidden">{patient.email}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{patient.email}</TableCell>
                          <TableCell>{patient.phone}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {format(new Date(patient.birthDate), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge className="bg-healthgreen-600">Ativo</Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Abrir menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>Agendar consulta</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Ver prontuário</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="inactive">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="hidden lg:table-cell">Nascimento</TableHead>
                      <TableHead className="hidden lg:table-cell">Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients
                      .filter(patient => patient.status === 'inactive')
                      .map((patient) => (
                        // Conteúdo similar ao anterior, apenas filtrado
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-500 md:hidden">{patient.email}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{patient.email}</TableCell>
                          <TableCell>{patient.phone}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {format(new Date(patient.birthDate), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="outline">Inativo</Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Abrir menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>Agendar consulta</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Ver prontuário</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Patients;
