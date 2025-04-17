
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Clinic } from '@/types';
import ClinicList from './ClinicList';
import ClinicForm from './ClinicForm';

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

      // Finalmente, deletar a clínica
      const { error: clinicError } = await supabase
        .from('clinics')
        .delete()
        .eq('id', id);
        
      if (clinicError) throw clinicError;
      
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Minhas Clínicas</CardTitle>
            <CardDescription>Gerencie suas clínicas e selecione a clínica ativa</CardDescription>
          </div>
          <Button onClick={handleAddClinic}>
            Nova Clínica
          </Button>
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
