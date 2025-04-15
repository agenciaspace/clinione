
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Phone, Mail, Globe, Save, Facebook, Instagram } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PublicPageSettings from '@/components/PublicPageSettings';

// Prefixos para os IDs de Serviço Social
const socialMediaPrefixes = {
  instagram: 'instagram.com/',
  facebook: 'facebook.com/',
  twitter: 'twitter.com/'
};

const ClinicProfile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const isPublicPageFocus = location.pathname === '/dashboard/public-page';
  const [activeTab, setActiveTab] = useState<string>(isPublicPageFocus ? 'publicPage' : 'profile');
  
  // Estado para os dados da clínica
  const [clinicData, setClinicData] = useState<any>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
    },
    slug: '',
    is_published: false,
    last_published_at: null
  });

  // Carregar dados da clínica
  useEffect(() => {
    const fetchClinicData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          // Transformar dados do banco para o formato do estado
          setClinicData({
            ...data,
            socialMedia: {
              facebook: data.facebook_id || '',
              instagram: data.instagram_id || '',
            }
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados da clínica:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da clínica.",
          variant: "destructive",
        });
      }
    };

    fetchClinicData();
  }, [user, toast]);

  // Atualizar estado com mudanças nos inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Atualizar campos aninhados de socialMedia
    if (name.startsWith('socialMedia.')) {
      const socialKey = name.split('.')[1];
      setClinicData(prevState => ({
        ...prevState,
        socialMedia: {
          ...prevState.socialMedia,
          [socialKey]: value
        }
      }));
    } else {
      setClinicData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  // Salvar dados da clínica
  const handleSave = async () => {
    if (!user?.id) return;

    try {
      // Preparar dados para salvar
      const clinicToSave = {
        name: clinicData.name,
        description: clinicData.description,
        address: clinicData.address,
        city: clinicData.city,
        state: clinicData.state,
        zip: clinicData.zip,
        phone: clinicData.phone,
        email: clinicData.email,
        website: clinicData.website,
        facebook_id: clinicData.socialMedia.facebook,
        instagram_id: clinicData.socialMedia.instagram,
        owner_id: user.id,
        updated_at: new Date().toISOString()
      };

      // Verificar se é uma inserção ou atualização
      if (clinicData.id) {
        const { error } = await supabase
          .from('clinics')
          .update(clinicToSave)
          .eq('id', clinicData.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('clinics')
          .insert({
            ...clinicToSave,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        
        // Atualizar o ID após criação
        if (data) {
          setClinicData(prevState => ({
            ...prevState,
            id: data.id
          }));
        }
      }

      toast({
        title: "Sucesso",
        description: "Dados da clínica salvos com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao salvar dados da clínica:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar os dados.",
        variant: "destructive",
      });
    }
  };

  // Função para atualizar o estado quando as configurações da página pública são alteradas
  const handlePublicPageUpdate = (updatedData: any) => {
    setClinicData(prevState => ({
      ...prevState,
      ...updatedData
    }));
  };

  // Limpar prefixo de URL ao exibir campos de redes sociais
  const cleanSocialUrl = (url: string, platform: string) => {
    const prefix = socialMediaPrefixes[platform as keyof typeof socialMediaPrefixes];
    if (url?.startsWith(prefix)) {
      return url.substring(prefix.length);
    }
    return url;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {isPublicPageFocus ? 'Página Pública' : 'Perfil da Clínica'}
            </h1>
            <p className="text-gray-500">
              {isPublicPageFocus 
                ? 'Configure sua página pública para atrair novos pacientes'
                : 'Gerenciar informações da sua clínica'}
            </p>
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-6"
        >
          <div className="bg-white p-1 rounded-lg shadow-sm border">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="profile">Perfil da Clínica</TabsTrigger>
              <TabsTrigger value="publicPage">Página Pública</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados principais da sua clínica
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Clínica</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Nome da sua clínica"
                      value={clinicData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Descreva sua clínica (especialidades, diferenciais, etc.)"
                      value={clinicData.description}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Rua, número, complemento"
                      value={clinicData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Cidade"
                        value={clinicData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="Estado"
                        value={clinicData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">CEP</Label>
                      <Input
                        id="zip"
                        name="zip"
                        placeholder="CEP"
                        value={clinicData.zip}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="(00) 0000-0000"
                      value={clinicData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="contato@suaclinica.com"
                      value={clinicData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Presença Online
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      placeholder="www.suaclinica.com"
                      value={clinicData.website}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="flex items-center">
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </Label>
                      <div className="flex">
                        <span className="bg-gray-100 flex items-center px-3 rounded-l border border-r-0 text-sm text-gray-500">
                          instagram.com/
                        </span>
                        <Input
                          id="instagram"
                          name="socialMedia.instagram"
                          placeholder="suaclinica"
                          value={cleanSocialUrl(clinicData.socialMedia?.instagram || '', 'instagram')}
                          onChange={handleInputChange}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="flex items-center">
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Label>
                      <div className="flex">
                        <span className="bg-gray-100 flex items-center px-3 rounded-l border border-r-0 text-sm text-gray-500">
                          facebook.com/
                        </span>
                        <Input
                          id="facebook"
                          name="socialMedia.facebook"
                          placeholder="suaclinica"
                          value={cleanSocialUrl(clinicData.socialMedia?.facebook || '', 'facebook')}
                          onChange={handleInputChange}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-2">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="publicPage" className="space-y-6">
            <PublicPageSettings clinicData={clinicData} onUpdate={handlePublicPageUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClinicProfile;
