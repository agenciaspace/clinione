
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Clinic } from '@/types';
import ClinicList from './ClinicList';
import ClinicForm from './ClinicForm';
import PublicPageSettings from './PublicPageSettings';

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  slug: string;
}

const ClinicManager: React.FC = () => {
  const { clinics, activeClinic, setActiveClinic, refreshClinics } = useClinic();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const baseUrl = "https://clini.one";

  const handleAddClinic = () => {
    setIsEditing(false);
    setEditingClinicId(null);
    setIsDialogOpen(true);
  };

  const handleEditClinic = (clinic: Clinic) => {
    setIsEditing(true);
    setEditingClinicId(clinic.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent, formData: ClinicFormData) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Verificar se o email foi confirmado
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser?.email_confirmed_at) {
      toast.error('Email não confirmado', {
        description: 'Você precisa confirmar seu email antes de criar ou editar clínicas.'
      });
      return;
    }
    
    try {
      if (isEditing && editingClinicId) {
        const { error } = await supabase
          .from('clinics')
          .update({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            slug: formData.slug || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingClinicId);
          
        if (error) throw error;
        
        toast.success('Clínica atualizada com sucesso');
      } else {
        const { data, error } = await supabase
          .from('clinics')
          .insert({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            slug: formData.slug || null,
            owner_id: user.id
          })
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          toast.success('Clínica criada com sucesso');
          setActiveClinic(data[0] as Clinic);
        }
      }
      
      setIsDialogOpen(false);
      refreshClinics();
    } catch (error) {
      console.error('Erro ao salvar clínica:', error);
      toast.error('Ocorreu um erro ao salvar a clínica');
    }
  };

  const handleDeleteClinic = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta clínica? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Excluir todos os pacientes relacionados à clínica
      const { error: patientsError } = await supabase
        .from('patients')
        .delete()
        .eq('clinic_id', id);
      
      if (patientsError) {
        console.error('Erro ao excluir pacientes:', patientsError);
        toast.error('Ocorreu um erro ao excluir os pacientes associados à clínica');
        setIsDeleting(false);
        return;
      }
      
      // Excluir todos os médicos relacionados à clínica
      const { error: doctorsError } = await supabase
        .from('doctors')
        .delete()
        .eq('clinic_id', id);
      
      if (doctorsError) {
        console.error('Erro ao excluir médicos:', doctorsError);
        toast.error('Ocorreu um erro ao excluir os médicos associados à clínica');
        setIsDeleting(false);
        return;
      }

      // Excluir todos os agendamentos relacionados à clínica
      const { error: appointmentsError } = await supabase
        .from('appointments')
        .delete()
        .eq('clinic_id', id);
      
      if (appointmentsError) {
        console.error('Erro ao excluir agendamentos:', appointmentsError);
        toast.error('Ocorreu um erro ao excluir os agendamentos associados à clínica');
        setIsDeleting(false);
        return;
      }
      
      // Agora excluímos todas as tabelas de webhook
      // Primeiro, deletar todas as entradas de webhook_events relacionadas à clínica
      const { error: webhookEventsError } = await supabase
        .from('webhook_events')
        .delete()
        .eq('clinic_id', id);
        
      if (webhookEventsError) {
        console.error('Erro ao excluir webhook events:', webhookEventsError);
        toast.error('Ocorreu um erro ao excluir os eventos de webhook associados à clínica');
        setIsDeleting(false);
        return;
      }
      
      // Verificar e excluir também registros na tabela webhook_endpoints
      const { error: webhookEndpointsError } = await supabase
        .from('webhook_endpoints')
        .delete()
        .eq('clinic_id', id);
      
      if (webhookEndpointsError) {
        console.error('Erro ao excluir webhook endpoints:', webhookEndpointsError);
        toast.error('Ocorreu um erro ao excluir os endpoints de webhook associados à clínica');
        setIsDeleting(false);
        return;
      }
      
      // Verificar e excluir também registros na tabela dead_webhook_events
      const { error: deadWebhookEventsError } = await supabase
        .from('dead_webhook_events')
        .delete()
        .eq('clinic_id', id);
      
      if (deadWebhookEventsError) {
        console.error('Erro ao excluir dead webhook events:', deadWebhookEventsError);
        toast.error('Ocorreu um erro ao excluir os eventos de webhook mortos associados à clínica');
        setIsDeleting(false);
        return;
      }

      // Excluir todas as transações relacionadas à clínica
      const { error: transactionsError } = await supabase
        .from('transactions')
        .delete()
        .eq('clinic_id', id);
      
      if (transactionsError) {
        console.error('Erro ao excluir transações:', transactionsError);
        toast.error('Ocorreu um erro ao excluir as transações associadas à clínica');
        setIsDeleting(false);
        return;
      }

      // Finalmente, deletar a clínica
      const { error: clinicError } = await supabase
        .from('clinics')
        .delete()
        .eq('id', id);
        
      if (clinicError) throw clinicError;
      
      // Se a clínica era a ativa, precisamos limpar o estado
      if (activeClinic?.id === id) {
        setActiveClinic(clinics.find(c => c.id !== id) || null);
      }
      
      toast.success('Clínica excluída com sucesso');
      refreshClinics();
    } catch (error) {
      console.error('Erro ao excluir clínica:', error);
      toast.error('Ocorreu um erro ao excluir a clínica');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishToggle = async (clinic: Clinic) => {
    if (!clinic.slug) {
      toast.error("URL personalizada necessária", {
        description: "Por favor, defina uma URL personalizada antes de publicar."
      });
      return;
    }

    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('clinics')
        .update({ 
          is_published: !clinic.is_published,
          last_published_at: !clinic.is_published ? new Date().toISOString() : null
        })
        .eq('id', clinic.id);

      if (error) throw error;
      
      toast.success(
        clinic.is_published ? "Página despublicada" : "Página publicada", 
        {
          description: clinic.is_published 
            ? "Sua página não está mais publicamente disponível." 
            : "Sua página agora está publicamente disponível."
        }
      );
      
      refreshClinics();
    } catch (error) {
      console.error('Erro ao atualizar status de publicação:', error);
      toast.error("Erro ao publicar", {
        description: "Não foi possível atualizar o status de publicação. Por favor, tente novamente."
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const getPublicUrl = (slug: string) => {
    return slug ? `${baseUrl}/c/${slug}` : '';
  };

  const handlePublicPageUpdate = (data: { slug: string, isPublished: boolean }) => {
    // Refresh clinics to get updated data
    refreshClinics();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="clinics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clinics">Gerenciar Clínicas</TabsTrigger>
          <TabsTrigger value="public-page" disabled={!activeClinic}>
            Página Pública
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clinics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Clínicas</CardTitle>
              <CardDescription>Gerencie suas clínicas e selecione a clínica ativa</CardDescription>
            </CardHeader>
            <CardContent>
              <ClinicList 
                clinics={clinics}
                activeClinic={activeClinic}
                onAddClinic={handleAddClinic}
                onSelectClinic={setActiveClinic}
                onEditClinic={handleEditClinic}
                onDeleteClinic={handleDeleteClinic}
                onPublishToggle={handlePublishToggle}
                isPublishing={isPublishing}
                isDeleting={isDeleting}
                getPublicUrl={getPublicUrl}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="public-page" className="space-y-6">
          {activeClinic ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PublicPageSettings
                clinicId={activeClinic.id}
                initialSlug={activeClinic.slug}
                initialIsPublished={activeClinic.is_published}
                onUpdate={handlePublicPageUpdate}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Preview da Página Pública</CardTitle>
                  <CardDescription>
                    Veja como sua página pública aparecerá para os visitantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => window.open(`/dashboard/public-page/${activeClinic.id}`, '_blank')}
                    >
                      Visualizar Página Pública
                    </Button>
                    
                    {activeClinic.slug && activeClinic.is_published && (
                      <Button 
                        variant="default" 
                        className="w-full" 
                        onClick={() => window.open(getPublicUrl(activeClinic.slug!), '_blank')}
                      >
                        Visitar Página Publicada
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  Selecione uma clínica para configurar a página pública
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ClinicForm
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditing={isEditing}
        editingClinicId={editingClinicId}
        onSubmit={handleSubmit}
        baseUrl={baseUrl}
      />
    </div>
  );
};

export default ClinicManager;
