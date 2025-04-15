import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { Upload, Facebook, Instagram, Globe, Clock, MapPin, Phone, Mail, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from "@/integrations/supabase/client";
import PublicPageSettings from '@/components/clinic/PublicPageSettings';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { WorkingHours } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

type WorkingHourPeriod = { start: string; end: string }[];

type Clinic = {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  about: string; // mapeado para description no banco de dados
  socialMedia: {
    facebook: string | null;
    instagram: string | null;
  };
  workingHours: WorkingHours;
  is_published: boolean | null;
};

const defaultWorkingHours: WorkingHours = {
  monday: [{ start: '08:00', end: '18:00' }],
  tuesday: [{ start: '08:00', end: '18:00' }],
  wednesday: [{ start: '08:00', end: '18:00' }],
  thursday: [{ start: '08:00', end: '18:00' }],
  friday: [{ start: '08:00', end: '18:00' }],
  saturday: [{ start: '08:00', end: '12:00' }],
  sunday: [],
};

const createClinicSchema = z.object({
  name: z.string().min(3, "O nome da clínica deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "A URL deve ter pelo menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens são permitidos")
    .optional(),
  description: z.string().optional(),
});

type CreateClinicFormValues = z.infer<typeof createClinicSchema>;

const ClinicProfile: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const createClinicForm = useForm<CreateClinicFormValues>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchClinics = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Erro ao buscar clínicas:", error);
          setClinics([]);
        } else if (data && data.length > 0) {
          console.log("Clínicas encontradas:", data);
          
          const formattedClinics = data.map(clinicData => {
            let workingHoursData: WorkingHours;
            
            if (clinicData.working_hours) {
              if (typeof clinicData.working_hours === 'object') {
                workingHoursData = clinicData.working_hours as WorkingHours;
              } else {
                console.warn("Formato de working_hours inválido, usando padrão");
                workingHoursData = defaultWorkingHours;
              }
            } else {
              workingHoursData = defaultWorkingHours;
            }
              
            return {
              id: clinicData.id,
              name: clinicData.name,
              slug: clinicData.slug,
              logo: clinicData.logo,
              address: clinicData.address,
              phone: clinicData.phone,
              email: clinicData.email,
              website: clinicData.website,
              about: clinicData.description || '',
              socialMedia: {
                facebook: clinicData.facebook_id || '',
                instagram: clinicData.instagram_id || '',
              },
              workingHours: workingHoursData,
              is_published: clinicData.is_published
            };
          });
          
          setClinics(formattedClinics);
          
          if (formattedClinics.length > 0 && !selectedClinicId) {
            setSelectedClinicId(formattedClinics[0].id);
            setClinic(formattedClinics[0]);
            setFormData(formattedClinics[0]);
          }
        } else {
          console.log("Nenhuma clínica encontrada");
          setClinics([]);
        }
      } catch (error) {
        console.error("Erro:", error);
        setClinics([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinicId && clinics.length > 0) {
      const selectedClinic = clinics.find(c => c.id === selectedClinicId);
      if (selectedClinic) {
        setClinic(selectedClinic);
        setFormData(selectedClinic);
      }
    }
  }, [selectedClinicId, clinics]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      socialMedia: { ...formData.socialMedia, [name]: value }
    });
  };

  const handleWorkingHoursChange = (day: string, period: 'start' | 'end', value: string) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: formData.workingHours[day as keyof typeof formData.workingHours].map((_, i) => 
          i === 0 ? { ...formData.workingHours[day as keyof typeof formData.workingHours][0], [period]: value } : _
        )
      }
    });
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !selectedClinicId) {
      toast.error("Nenhuma clínica selecionada", {
        description: "Por favor, selecione uma clínica para atualizar."
      });
      return;
    }
    
    try {
      const updateData = {
        name: formData.name,
        description: formData.about,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        facebook_id: formData.socialMedia?.facebook,
        instagram_id: formData.socialMedia?.instagram,
        working_hours: formData.workingHours,
      };
      
      console.log("Atualizando clínica com ID:", selectedClinicId);
      console.log("Dados de atualização:", updateData);
      
      const { error, data } = await supabase
        .from('clinics')
        .update(updateData)
        .eq('id', selectedClinicId)
        .select();
      
      console.log("Resultado da atualização:", data);
      
      if (error) {
        console.error("Erro detalhado:", error);
        throw error;
      }
      
      setClinics(prev => 
        prev.map(c => c.id === selectedClinicId ? { ...c, ...formData } : c)
      );
      
      setClinic(formData);
      setIsEditing(false);
      
      toast("Perfil atualizado", {
        description: "As informações da clínica foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar clínica:", error);
      toast.error("Erro ao atualizar", {
        description: "Ocorreu um erro ao atualizar as informações da clínica."
      });
    }
  };

  const handlePublicPageUpdate = ({ slug, isPublished }: { slug: string, isPublished: boolean }) => {
    if (!clinic) return;
    
    const updatedClinic = {
      ...clinic,
      slug,
      is_published: isPublished
    };
    
    setClinic(updatedClinic);
    
    if (formData) {
      setFormData({
        ...formData,
        slug,
        is_published: isPublished
      });
    }
    
    setClinics(prev => 
      prev.map(c => c.id === selectedClinicId ? updatedClinic : c)
    );
  };

  const handleCreateClinic = async (values: CreateClinicFormValues) => {
    try {
      setIsCreating(true);
      
      if (!user || !user.id) {
        toast.error("Erro de autenticação", {
          description: "Você precisa estar logado para criar uma clínica."
        });
        setIsCreating(false);
        return false;
      }
      
      const newClinicData = {
        name: values.name,
        description: values.description || '',
        slug: values.slug || undefined,
        working_hours: defaultWorkingHours,
        owner_id: user.id
      };
      
      console.log("Criando nova clínica:", newClinicData);
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error("Sessão expirada", {
          description: "Sua sessão expirou. Por favor, faça login novamente."
        });
        navigate('/login');
        return false;
      }
      
      const { data, error } = await supabase
        .from('clinics')
        .insert(newClinicData)
        .select();
      
      if (error) {
        console.error("Erro detalhado ao criar clínica:", error);
        throw error;
      }
      
      console.log("Clínica criada com sucesso:", data);
      
      if (data && data.length > 0) {
        const newClinic: Clinic = {
          id: data[0].id,
          name: data[0].name,
          slug: data[0].slug,
          logo: data[0].logo,
          address: data[0].address,
          phone: data[0].phone,
          email: data[0].email,
          website: data[0].website,
          about: data[0].description || '',
          socialMedia: {
            facebook: data[0].facebook_id || '',
            instagram: data[0].instagram_id || '',
          },
          workingHours: data[0].working_hours as WorkingHours || defaultWorkingHours,
          is_published: data[0].is_published
        };
        
        setClinics([newClinic, ...clinics]);
        
        setSelectedClinicId(newClinic.id);
        setClinic(newClinic);
        setFormData(newClinic);
        
        toast.success("Clínica criada", {
          description: "Sua nova clínica foi criada com sucesso."
        });
        
        createClinicForm.reset();
        setIsCreating(false);
        
        return true;
      }
      
      setIsCreating(false);
      return false;
    } catch (error: any) {
      console.error("Erro ao criar clínica:", error);
      let errorMessage = error.message || "Ocorreu um erro ao criar a clínica.";
      
      if (error.code === '42501' || errorMessage.includes('row-level security')) {
        errorMessage = "Erro de permissão: Você não tem permissão para criar uma clínica. Por favor, faça login novamente.";
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
      
      toast.error("Erro ao criar clínica", {
        description: errorMessage
      });
      setIsCreating(false);
      return false;
    }
  };

  const weekdays = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-healthblue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados da clínica...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perfil da Clínica</h1>
          <p className="text-gray-500">Gerencie as informações da sua clínica</p>
        </div>
        <div className="flex gap-2">
          {clinics.length > 0 && (
            <div className="flex items-center mr-2">
              <Label htmlFor="clinic-select" className="mr-2">Clínica:</Label>
              <select 
                id="clinic-select"
                className="border rounded-md px-3 py-2 text-sm"
                value={selectedClinicId || ''}
                onChange={(e) => setSelectedClinicId(e.target.value)}
              >
                {clinics.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Nova Clínica
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Clínica</DialogTitle>
                <DialogDescription>
                  Digite os detalhes para sua nova clínica.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...createClinicForm}>
                <form onSubmit={createClinicForm.handleSubmit(handleCreateClinic)} className="space-y-4">
                  <FormField
                    control={createClinicForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Clínica</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Digite o nome da clínica" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createClinicForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Personalizada</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="text-gray-500 pr-1">clini.one/c/</span>
                            <Input 
                              {...field} 
                              placeholder="sua-clinica" 
                              onChange={e => {
                                const sanitizedSlug = e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, '-')
                                  .replace(/-+/g, '-')
                                  .replace(/^-|-$/g, '');
                                field.onChange(sanitizedSlug);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Esta será a URL pública para a página da sua clínica.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createClinicForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Descrição da sua clínica"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Criando..." : "Criar Clínica"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {clinic && (
            <Button 
              variant={isEditing ? "outline" : "default"} 
              onClick={() => {
                if (isEditing) {
                  setFormData(clinic);
                }
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </Button>
          )}
        </div>
      </div>
      
      {clinics.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white p-8 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Nenhuma Clínica Ainda</h2>
          <p className="text-gray-600 text-center mb-4">
            Você ainda não criou nenhuma clínica. Comece adicionando sua primeira clínica.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Sua Primeira Clínica
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Clínica</DialogTitle>
                <DialogDescription>
                  Digite os detalhes para sua nova clínica.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...createClinicForm}>
                <form onSubmit={createClinicForm.handleSubmit(handleCreateClinic)} className="space-y-4">
                  <FormField
                    control={createClinicForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Clínica</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Digite o nome da clínica" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createClinicForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Personalizada</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="text-gray-500 pr-1">clini.one/c/</span>
                            <Input 
                              {...field} 
                              placeholder="sua-clinica" 
                              onChange={e => {
                                const sanitizedSlug = e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, '-')
                                  .replace(/-+/g, '-')
                                  .replace(/^-|-$/g, '');
                                field.onChange(sanitizedSlug);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Esta será a URL pública para a página da sua clínica.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createClinicForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Descrição da sua clínica"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Criando..." : "Criar Clínica"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      ) : clinic ? (
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Informações Básicas</TabsTrigger>
            <TabsTrigger value="contact">Contato</TabsTrigger>
            <TabsTrigger value="hours">Horários</TabsTrigger>
            <TabsTrigger value="public">Página Pública</TabsTrigger>
            <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Detalhes da Clínica</CardTitle>
                  <CardDescription>
                    Informações básicas sobre sua clínica
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveChanges} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome da Clínica</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData?.name || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="about">Sobre a Clínica</Label>
                        <Textarea
                          id="about"
                          name="about"
                          value={formData?.about || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={4}
                        />
                      </div>
                    </div>
                    
                    {isEditing && (
                      <Button type="submit" className="mt-6">
                        Salvar Alterações
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Logo</CardTitle>
                  <CardDescription>
                    Logo da sua clínica
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    {clinic.logo ? (
                      <div className="relative w-40 h-40">
                        <img
                          src={clinic.logo}
                          alt={`Logo para ${clinic.name}`}
                          className="w-full h-full object-contain"
                        />
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute bottom-0 right-0"
                          >
                            Alterar
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="w-40 h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400">
                        <Upload className="h-10 w-10 mb-2" />
                        <p className="text-sm">Logo da Clínica</p>
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                          >
                            Enviar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="contact">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                  <CardDescription>
                    Como os pacientes podem entrar em contato com sua clínica
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveChanges} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData?.address || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData?.phone || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData?.email || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Site</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData?.website || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    {isEditing && (
                      <Button type="submit" className="mt-6">
                        Salvar Alterações
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociais</CardTitle>
                  <CardDescription>
                    Conecte sua clínica às redes sociais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveChanges} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Facebook className="h-5 w-5 text-blue-600" />
                        <Label htmlFor="facebook">Facebook</Label>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 pr-1">facebook.com/</span>
                        <Input
                          id="facebook"
                          name="facebook"
                          value={formData?.socialMedia?.facebook || ''}
                          onChange={handleSocialMediaChange}
                          disabled={!isEditing}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Instagram className="h-5 w-5 text-pink-600" />
                        <Label htmlFor="instagram">Instagram</Label>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 pr-1">instagram.com/</span>
                        <Input
                          id="instagram"
                          name="instagram"
                          value={formData?.socialMedia?.instagram || ''}
                          onChange={handleSocialMediaChange}
                          disabled={!isEditing}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    {isEditing && (
                      <Button type="submit" className="mt-6">
                        Salvar Alterações
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Horário de Funcionamento</CardTitle>
                <CardDescription>
                  Defina os horários de funcionamento da sua clínica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveChanges} className="space-y-4">
                  {weekdays.map((day) => (
                    <div key={day.key} className="grid grid-cols-1 sm:grid-cols-5 items-center gap-4">
                      <div className="sm:col-span-1 font-medium">{day.label}</div>
                      
                      {formData?.workingHours[day.key as keyof typeof formData.workingHours]?.length > 0 ? (
                        <>
                          <div className="sm:col-span-2">
                            <Label htmlFor={`${day.key}-start`} className="sr-only">Hora Inicial</Label>
                            <Input
                              id={`${day.key}-start`}
                              type="time"
                              value={formData?.workingHours[day.key as keyof typeof formData.workingHours][0]?.start || ''}
                              onChange={(e) => handleWorkingHoursChange(day.key, 'start', e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="text-center">até</div>
                          <div className="sm:col-span-2">
                            <Label htmlFor={`${day.key}-end`} className="sr-only">Hora Final</Label>
                            <Input
                              id={`${day.key}-end`}
                              type="time"
                              value={formData?.workingHours[day.key as keyof typeof formData.workingHours][0]?.end || ''}
                              onChange={(e) => handleWorkingHoursChange(day.key, 'end', e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="sm:col-span-4 text-gray-500 italic">
                          Fechado
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <Button type="submit" className="mt-6">
                      Salvar Alterações
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="public">
            <div className="max-w-2xl mx-auto">
              <PublicPageSettings 
                clinicId={clinic.id}
                initialSlug={clinic.slug}
                initialIsPublished={clinic.is_published}
                onUpdate={handlePublicPageUpdate}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pré-visualização da Página Pública</CardTitle>
                  <CardDescription>
                    Como sua página aparecerá para os visitantes
                  </CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    navigate('/dashboard/public-page');
                  }}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Ver Prévia
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-white">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center pb-6 border-b">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-healthblue-100 rounded-full flex items-center justify-center text-healthblue-600 font-bold text-lg">
                        {clinic.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{clinic.name}</h2>
                        <p className="text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {clinic.address ? clinic.address.split(',')[0] : "Sem endereço informado"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <Button>Agendar Consulta</Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold mb-2">Sobre a Clínica</h3>
                      <p className="text-gray-600">{clinic.about || "Sem descrição informada"}</p>
                      
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Contato</h3>
                        <div className="space-y-2">
                          {clinic.phone && (
                            <p className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-2 text-healthblue-500" />
                              {clinic.phone}
                            </p>
                          )}
                          {clinic.email && (
                            <p className="flex items-center text-gray-600">
                              <Mail className="h-4 w-4 mr-2 text-healthblue-500" />
                              {clinic.email}
                            </p>
                          )}
                          {clinic.website && (
                            <p className="flex items-center text-gray-600">
                              <Globe className="h-4 w-4 mr-2 text-healthblue-500" />
                              {clinic.website}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-healthblue-500" />
                          Horários
                        </h3>
                        
                        <div className="space-y-2">
                          {weekdays.map((day) => (
                            <div key={day.key} className="flex justify-between">
                              <span className="text-gray-600">{day.label}</span>
                              <span className="font-medium">
                                {clinic.workingHours[day.key as keyof typeof clinic.workingHours]?.length > 0 
                                  ? `${clinic.workingHours[day.key as keyof typeof clinic.workingHours][0].start} - ${clinic.workingHours[day.key as keyof typeof clinic.workingHours][0].end}`
                                  : 'Fechado'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <p className="text-gray-500">Por favor, selecione uma clínica para ver seus detalhes</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClinicProfile;
