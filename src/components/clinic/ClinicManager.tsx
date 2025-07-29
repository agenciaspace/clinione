
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Clinic } from '@/types';
import ClinicList from './ClinicList';
import ClinicForm from './ClinicForm';
import PublicPageSettings from './PublicPageSettings';
import { useClinicMutations } from '@/hooks/useClinicMutations';

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  slug: string;
}

const ClinicManager: React.FC = () => {
  const { clinics, activeClinic, setActiveClinic } = useClinic();
  const { user, isEmailVerified } = useAuth();
  const { createClinic, updateClinic, deleteClinic, togglePublish } = useClinicMutations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const baseUrl = "https://clini.one";

  const handleAddClinic = () => {
    if (!isEmailVerified) {
      toast.error('Email não confirmado', {
        description: 'Confirme seu email antes de criar clínicas.'
      });
      return;
    }
    setIsEditing(false);
    setEditingClinicId(null);
    setIsDialogOpen(true);
  };

  const handleEditClinic = (clinic: Clinic) => {
    if (!isEmailVerified) {
      toast.error('Email não confirmado', {
        description: 'Confirme seu email antes de editar clínicas.'
      });
      return;
    }
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
    if (!isEmailVerified) {
      toast.error('Email não confirmado', {
        description: 'Você precisa confirmar seu email antes de criar ou editar clínicas.'
      });
      return;
    }
    
    if (isEditing && editingClinicId) {
      await updateClinic.mutateAsync({ clinicId: editingClinicId, formData });
    } else {
      const newClinic = await createClinic.mutateAsync({ formData, userId: user.id });
      if (newClinic) {
        setActiveClinic(newClinic);
      }
    }
    
    setIsDialogOpen(false);
  };

  const handleDeleteClinic = async (id: string) => {
    if (!isEmailVerified) {
      toast.error('Email não confirmado', {
        description: 'Confirme seu email antes de excluir clínicas.'
      });
      return;
    }
    
    if (!confirm('Tem certeza que deseja excluir esta clínica? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      await deleteClinic.mutateAsync(id);
      
      // Se a clínica era a ativa, precisamos limpar o estado
      if (activeClinic?.id === id) {
        setActiveClinic(clinics.find(c => c.id !== id) || null);
      }
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Erro ao excluir clínica:', error);
    }
  };


  const handlePublishToggle = async (clinic: Clinic) => {
    if (!isEmailVerified) {
      toast.error('Email não confirmado', {
        description: 'Confirme seu email antes de publicar clínicas.'
      });
      return;
    }
    
    if (!clinic.slug) {
      toast.error("URL personalizada necessária", {
        description: "Por favor, defina uma URL personalizada antes de publicar."
      });
      return;
    }

    await togglePublish.mutateAsync({ clinicId: clinic.id, isPublished: clinic.is_published });
  };

  const getPublicUrl = (slug: string) => {
    return slug ? `${baseUrl}/c/${slug}` : '';
  };

  const handlePublicPageUpdate = (data: { slug: string, isPublished: boolean }) => {
    // Data will be automatically updated via React Query cache invalidation
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
                isPublishing={togglePublish.isPending}
                isDeleting={deleteClinic.isPending}
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
