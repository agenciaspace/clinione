
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface PublicPageSettingsProps {
  clinicId: string;
  initialSlug: string | null;
  initialIsPublished: boolean | null;
  onUpdate: (data: { slug: string, isPublished: boolean }) => void;
}

const PublicPageSettings: React.FC<PublicPageSettingsProps> = ({ 
  clinicId, 
  initialSlug, 
  initialIsPublished,
  onUpdate 
}) => {
  const [slug, setSlug] = useState(initialSlug || '');
  const [isPublished, setIsPublished] = useState(initialIsPublished || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [clinicExists, setClinicExists] = useState(true);
  
  // Use the custom domain instead of the application base URL
  const baseUrl = "https://clini.one";

  // Verifica se a clínica existe e é válida
  useEffect(() => {
    const checkClinic = async () => {
      if (!clinicId) {
        console.error("ID da clínica não fornecido");
        setClinicExists(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('id')
          .eq('id', clinicId)
          .single();
        
        if (error || !data) {
          console.error("Clínica não encontrada:", error);
          setClinicExists(false);
        } else {
          setClinicExists(true);
        }
      } catch (error) {
        console.error("Erro ao verificar clínica:", error);
        setClinicExists(false);
      }
    };

    checkClinic();
  }, [clinicId]);

  const handlePublishToggle = async () => {
    if (!slug) {
      toast.error("URL personalizada é necessária", {
        description: "Por favor, defina uma URL personalizada antes de publicar."
      });
      return;
    }

    if (!clinicExists) {
      toast.error("Clínica não encontrada", {
        description: "Não foi possível encontrar a clínica para atualizar."
      });
      return;
    }

    setIsUpdating(true);
    try {
      console.log("Atualizando status de publicação para a clínica:", clinicId);
      
      const { error } = await supabase
        .from('clinics')
        .update({ 
          is_published: !isPublished,
          last_published_at: !isPublished ? new Date().toISOString() : null
        })
        .eq('id', clinicId);

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      setIsPublished(!isPublished);
      onUpdate({ slug, isPublished: !isPublished });
      
      toast.success(
        isPublished ? "Página despublicada" : "Página publicada", 
        {
          description: isPublished 
            ? "Sua página não está mais disponível publicamente." 
            : "Sua página está agora disponível publicamente."
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar status de publicação:', error);
      toast.error("Erro ao publicar", {
        description: "Não foi possível atualizar o status de publicação. Tente novamente."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove special characters and replace spaces with hyphens
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
      
    setSlug(value);
  };

  const handleSlugSave = async () => {
    if (!slug) {
      toast.error("URL inválida", {
        description: "Por favor, defina uma URL personalizada válida."
      });
      return;
    }

    if (!clinicExists) {
      toast.error("Clínica não encontrada", {
        description: "Não foi possível encontrar a clínica para atualizar."
      });
      return;
    }

    setIsUpdating(true);
    try {
      console.log("Atualizando slug para a clínica:", clinicId);
      
      // Verifica se o slug já existe
      const { data: existingSlug, error: slugCheckError } = await supabase
        .from('clinics')
        .select('id')
        .eq('slug', slug)
        .neq('id', clinicId);

      if (slugCheckError) {
        console.error('Erro ao verificar slug existente:', slugCheckError);
        throw new Error("Erro ao verificar disponibilidade da URL");
      }

      if (existingSlug && existingSlug.length > 0) {
        throw new Error("Esta URL já está em uso por outra clínica");
      }
      
      const { error } = await supabase
        .from('clinics')
        .update({ slug })
        .eq('id', clinicId);

      if (error) {
        console.error('Erro detalhado ao atualizar slug:', error);
        throw error;
      }

      onUpdate({ slug, isPublished });
      
      toast.success("URL atualizada", {
        description: "A URL personalizada da sua clínica foi atualizada com sucesso."
      });
    } catch (error: any) {
      console.error('Erro ao atualizar slug:', error);
      toast.error("Erro ao atualizar URL", {
        description: error.message || "Não foi possível atualizar a URL personalizada."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Formato: clini.one/c/slug
  const publicUrl = slug ? `${baseUrl}/c/${slug}` : '';

  if (!clinicExists) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Página Pública</CardTitle>
          <CardDescription>
            Configure e publique a página pública da sua clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-red-500 mb-2">Clínica não encontrada</p>
            <p className="text-gray-500">
              É necessário criar ou selecionar uma clínica antes de configurar a página pública.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Página Pública</CardTitle>
        <CardDescription>
          Configure e publique a página pública da sua clínica
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="slug">URL Personalizada</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-gray-500 pr-1 whitespace-nowrap">{baseUrl}/c/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="nome-da-sua-clinica"
                    className="flex-1"
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSlugSave} 
                disabled={isUpdating || slug === initialSlug || !slug}
              >
                Salvar URL
              </Button>
            </div>
          </div>

          {slug && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                  <a 
                    href={publicUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-healthblue-600 hover:underline"
                  >
                    {publicUrl}
                  </a>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    toast.success("URL copiada", {
                      description: "A URL foi copiada para a área de transferência."
                    });
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <h4 className="font-medium">Status da página</h4>
              <p className="text-sm text-gray-500">
                {isPublished 
                  ? "Sua página está publicada e disponível publicamente." 
                  : "Sua página não está publicada e só pode ser vista por você."}
              </p>
            </div>
            <Button 
              onClick={handlePublishToggle}
              disabled={isUpdating || !slug}
              variant={isPublished ? "destructive" : "default"}
            >
              <Globe className="h-4 w-4 mr-2" />
              {isPublished ? "Despublicar" : "Publicar"}
            </Button>
          </div>

          {isPublished && (
            <div className="pt-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => window.open(publicUrl, '_blank')}
              >
                <Globe className="h-4 w-4 mr-2" />
                Visitar Página Pública
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicPageSettings;
