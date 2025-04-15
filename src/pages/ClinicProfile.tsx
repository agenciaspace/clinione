
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { Upload, Facebook, Instagram, Globe, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from "@/integrations/supabase/client";
import PublicPageSettings from '@/components/clinic/PublicPageSettings';

// Define the expected structure for working hours
type WorkingHourPeriod = { start: string; end: string }[];

type WorkingHours = {
  monday: WorkingHourPeriod;
  tuesday: WorkingHourPeriod;
  wednesday: WorkingHourPeriod;
  thursday: WorkingHourPeriod;
  friday: WorkingHourPeriod;
  saturday: WorkingHourPeriod;
  sunday: WorkingHourPeriod;
};

const mockClinic = {
  id: '1',
  name: 'Clínica Saúde & Bem-estar',
  slug: 'clinica-saude-bem-estar',
  logo: '', // Seria a URL da imagem
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100',
  phone: '(11) 3000-5000',
  email: 'contato@clinicasaude.com',
  website: 'www.clinicasaude.com',
  about: 'Somos uma clínica multiprofissional dedicada à saúde e bem-estar. Oferecemos atendimento em diversas especialidades com profissionais altamente qualificados.',
  socialMedia: {
    facebook: 'clinicasaude',
    instagram: 'clinica_saude',
  },
  workingHours: {
    monday: [{ start: '08:00', end: '18:00' }],
    tuesday: [{ start: '08:00', end: '18:00' }],
    wednesday: [{ start: '08:00', end: '18:00' }],
    thursday: [{ start: '08:00', end: '18:00' }],
    friday: [{ start: '08:00', end: '18:00' }],
    saturday: [{ start: '08:00', end: '12:00' }],
    sunday: [],
  } as WorkingHours,
  is_published: false,
};

const ClinicProfile: React.FC = () => {
  const [clinic, setClinic] = useState(mockClinic);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(mockClinic);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClinicData = async () => {
      setIsLoading(true);
      
      try {
        // Primeiro, tentamos buscar clinicas do usuário atual
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .limit(1);
          
        console.log("Dados da consulta:", data);
        console.log("Erro da consulta (se houver):", error);
          
        if (error) {
          console.error("Error fetching clinic:", error);
          setClinic(mockClinic);
          setFormData(mockClinic);
        } else if (data && data.length > 0) {
          const clinicData = data[0];
          console.log("Clínica encontrada:", clinicData);
          
          // Parse and validate working hours from the database
          let parsedWorkingHours: WorkingHours;
          try {
            // Check if working_hours is a valid object with the expected structure
            if (clinicData.working_hours && typeof clinicData.working_hours === 'object') {
              parsedWorkingHours = clinicData.working_hours as WorkingHours;
              
              // Ensure all required days are present
              const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
              for (const day of requiredDays) {
                if (!parsedWorkingHours[day as keyof WorkingHours]) {
                  parsedWorkingHours[day as keyof WorkingHours] = [];
                }
              }
            } else {
              // If not valid, use the default working hours
              parsedWorkingHours = mockClinic.workingHours;
            }
          } catch (e) {
            console.error("Error parsing working hours:", e);
            parsedWorkingHours = mockClinic.workingHours;
          }
          
          const formattedData = {
            ...clinicData,
            id: clinicData.id || mockClinic.id,
            name: clinicData.name || mockClinic.name,
            slug: clinicData.slug || mockClinic.slug,
            logo: clinicData.logo || mockClinic.logo,
            address: clinicData.address || mockClinic.address,
            phone: clinicData.phone || mockClinic.phone,
            email: clinicData.email || mockClinic.email,
            website: clinicData.website || mockClinic.website,
            about: clinicData.description || '',
            socialMedia: {
              facebook: clinicData.facebook_id || '',
              instagram: clinicData.instagram_id || '',
            },
            workingHours: parsedWorkingHours,
            is_published: clinicData.is_published || false
          };
          
          console.log("Dados formatados:", formattedData);
          setClinic(formattedData);
          setFormData(formattedData);
        } else {
          console.log("Nenhuma clínica encontrada, usando mock data");
          setClinic(mockClinic);
          setFormData(mockClinic);
        }
      } catch (error) {
        console.error("Error:", error);
        setClinic(mockClinic);
        setFormData(mockClinic);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClinicData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      socialMedia: { ...formData.socialMedia, [name]: value }
    });
  };

  const handleWorkingHoursChange = (day: string, period: 'start' | 'end', value: string) => {
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
    
    try {
      const updateData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.about,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        facebook_id: formData.socialMedia?.facebook,
        instagram_id: formData.socialMedia?.instagram,
        working_hours: formData.workingHours,
      };
      
      console.log("Atualizando clínica com ID:", formData.id);
      console.log("Dados para atualização:", updateData);
      
      if (formData.id) {
        const { error, data } = await supabase
          .from('clinics')
          .update(updateData)
          .eq('id', formData.id)
          .select();
        
        console.log("Resultado da atualização:", data);
        
        if (error) {
          console.error("Erro detalhado:", error);
          throw error;
        }
      }
      
      setClinic(formData);
      setIsEditing(false);
      
      toast("Perfil atualizado", {
        description: "As informações da clínica foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Error updating clinic:", error);
      toast.error("Erro ao atualizar", {
        description: "Ocorreu um erro ao atualizar as informações da clínica."
      });
    }
  };

  const handlePublicPageUpdate = ({ slug, isPublished }: { slug: string, isPublished: boolean }) => {
    setClinic({
      ...clinic,
      slug,
      is_published: isPublished
    });
    
    setFormData({
      ...formData,
      slug,
      is_published: isPublished
    });
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perfil da Clínica</h1>
          <p className="text-gray-500">Gerencie as informações da sua clínica</p>
        </div>
        <div>
          <Button 
            variant={isEditing ? "outline" : "default"} 
            onClick={() => {
              if (isEditing) {
                setFormData(clinic); // Reset form data
              }
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? 'Cancelar' : 'Editar Perfil'}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Informações Básicas</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="hours">Horários</TabsTrigger>
          <TabsTrigger value="public">Página Pública</TabsTrigger>
          <TabsTrigger value="preview">Visualizar Página</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Dados da Clínica</CardTitle>
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
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Personalizada</Label>
                      <div className="flex items-center">
                        <span className="text-gray-500 pr-1">clinica.app/</span>
                        <Input
                          id="slug"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="about">Sobre a Clínica</Label>
                      <Textarea
                        id="about"
                        name="about"
                        value={formData.about}
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
                        alt={`Logo da ${clinic.name}`}
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
                          Fazer Upload
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
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
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
                        value={formData.socialMedia?.facebook || ''}
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
                        value={formData.socialMedia?.instagram || ''}
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
              <CardTitle>Horários de Funcionamento</CardTitle>
              <CardDescription>
                Defina os horários de atendimento da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveChanges} className="space-y-4">
                {weekdays.map((day) => (
                  <div key={day.key} className="grid grid-cols-1 sm:grid-cols-5 items-center gap-4">
                    <div className="sm:col-span-1 font-medium">{day.label}</div>
                    
                    {formData.workingHours[day.key as keyof typeof formData.workingHours]?.length > 0 ? (
                      <React.Fragment>
                        <div className="sm:col-span-2">
                          <Label htmlFor={`${day.key}-start`} className="sr-only">Hora de Início</Label>
                          <Input
                            id={`${day.key}-start`}
                            type="time"
                            value={formData.workingHours[day.key as keyof typeof formData.workingHours][0]?.start || ''}
                            onChange={(e) => handleWorkingHoursChange(day.key, 'start', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="text-center">até</div>
                        <div className="sm:col-span-2">
                          <Label htmlFor={`${day.key}-end`} className="sr-only">Hora de Término</Label>
                          <Input
                            id={`${day.key}-end`}
                            type="time"
                            value={formData.workingHours[day.key as keyof typeof formData.workingHours][0]?.end || ''}
                            onChange={(e) => handleWorkingHoursChange(day.key, 'end', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                      </React.Fragment>
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
                <CardTitle>Visualização da Página Pública</CardTitle>
                <CardDescription>
                  Assim que sua página ficará para os visitantes
                </CardDescription>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  if (clinic.slug) {
                    window.open(`https://clini.one/c/${clinic.slug}`, '_blank');
                  }
                }}
                disabled={!clinic.slug}
              >
                <Globe className="mr-2 h-4 w-4" />
                Visitar Página
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
                        {clinic.address.split(',')[0]}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button>Agendar Consulta</Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-3">Sobre a Clínica</h3>
                    <p className="text-gray-600">{clinic.about}</p>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Contato</h3>
                      <div className="space-y-2">
                        <p className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-healthblue-500" />
                          {clinic.phone}
                        </p>
                        <p className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-healthblue-500" />
                          {clinic.email}
                        </p>
                        <p className="flex items-center text-gray-600">
                          <Globe className="h-4 w-4 mr-2 text-healthblue-500" />
                          {clinic.website}
                        </p>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <h3 className="text-lg font-semibold mb-3">Nossa Equipe</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center p-4 border rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                          JC
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">Dr. João Cardoso</p>
                          <p className="text-sm text-gray-500">Cardiologista</p>
                        </div>
                      </div>
                      <div className="flex items-center p-4 border rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                          AB
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">Dra. Ana Beatriz</p>
                          <p className="text-sm text-gray-500">Dermatologista</p>
                        </div>
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
                      
                      <div className="mt-4 flex justify-center">
                        <Button variant="outline" size="sm">Agendar Consulta</Button>
                      </div>
                    </div>
                    
                    <div className="mt-6 border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3">Avaliações</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center">
                            <span className="text-yellow-400">★★★★★</span>
                            <span className="ml-2 font-medium">Excelente atendimento</span>
                          </div>
                          <p className="text-gray-600 text-sm">Maria S.</p>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="text-yellow-400">★★★★☆</span>
                            <span className="ml-2 font-medium">Muito bom</span>
                          </div>
                          <p className="text-gray-600 text-sm">João P.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ClinicProfile;
