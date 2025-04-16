
import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  lastVisit?: string;
  status: 'active' | 'inactive';
}

interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
}

const Patients = () => {
  const { activeClinic } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [patientForm, setPatientForm] = useState<PatientFormData>({
    name: '',
    email: '',
    phone: '',
    birthDate: new Date().toISOString().split('T')[0]
  });
  
  useEffect(() => {
    if (activeClinic) {
      fetchPatients();
    } else {
      setPatients([]);
    }
  }, [activeClinic]);

  const fetchPatients = async () => {
    if (!activeClinic) return;
    
    setIsLoading(true);
    try {
      // Simulando uma chamada de API
      // Em um ambiente real, esta seria uma chamada para o Supabase ou outra API
      setTimeout(() => {
        // Array vazia para simular que ainda não há dados
        setPatients([]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      toast.error("Erro ao carregar pacientes");
      setIsLoading(false);
    }
  };

  // Filtrar pacientes com base na pesquisa
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeClinic) {
      toast.error("Selecione uma clínica para adicionar um paciente");
      return;
    }

    try {
      // Simulando uma inserção de dados
      // Em um ambiente real, esta seria uma inserção no Supabase ou outra API
      
      const newPatient: Patient = {
        id: crypto.randomUUID(),
        name: patientForm.name,
        email: patientForm.email,
        phone: patientForm.phone,
        birthDate: patientForm.birthDate,
        status: 'active'
      };
      
      // Adicionando o novo paciente ao array local
      setPatients([...patients, newPatient]);
      
      // Reset do formulário
      setPatientForm({
        name: '',
        email: '',
        phone: '',
        birthDate: new Date().toISOString().split('T')[0]
      });
      
      setIsAddPatientOpen(false);
      
      toast("Paciente adicionado", {
        description: "O novo paciente foi cadastrado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar paciente:", error);
      toast.error("Erro ao adicionar paciente");
    }
  };

  const handleDeletePatient = async (id: string) => {
    try {
      // Simulando uma deleção
      // Em um ambiente real, esta seria uma deleção no Supabase ou outra API
      setPatients(patients.filter(patient => patient.id !== id));
      
      toast.success("Paciente removido com sucesso");
    } catch (error) {
      console.error("Erro ao remover paciente:", error);
      toast.error("Erro ao remover paciente");
    }
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
                          <Input 
                            id="name" 
                            name="name" 
                            value={patientForm.name}
                            onChange={handleInputChange}
                            placeholder="Nome do paciente" 
                            required 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            name="email"
                            value={patientForm.email}
                            onChange={handleInputChange}
                            type="email" 
                            placeholder="email@exemplo.com" 
                            required 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input 
                            id="phone" 
                            name="phone"
                            value={patientForm.phone}
                            onChange={handleInputChange}
                            placeholder="(00) 00000-0000" 
                            required 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="birthDate">Data de nascimento</Label>
                          <Input 
                            id="birthDate" 
                            name="birthDate"
                            value={patientForm.birthDate}
                            onChange={handleInputChange}
                            type="date" 
                            required 
                          />
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center py-6 text-gray-500">
                          Nenhum paciente encontrado. Adicione seu primeiro paciente usando o botão acima.
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
                                <DropdownMenuItem 
                                  className="cursor-pointer text-red-600"
                                  onClick={() => handleDeletePatient(patient.id)}
                                >
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPatients.filter(p => p.status === 'active').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center py-6 text-gray-500">
                          Nenhum paciente ativo encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPatients
                        .filter(patient => patient.status === 'active')
                        .map((patient) => (
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
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-red-600"
                                    onClick={() => handleDeletePatient(patient.id)}
                                  >
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPatients.filter(p => p.status === 'inactive').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center py-6 text-gray-500">
                          Nenhum paciente inativo encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPatients
                        .filter(patient => patient.status === 'inactive')
                        .map((patient) => (
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
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-red-600"
                                    onClick={() => handleDeletePatient(patient.id)}
                                  >
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
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Patients;
