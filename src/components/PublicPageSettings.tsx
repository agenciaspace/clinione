
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Globe, Link2, Save, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface PublicPageSettingsProps {
  clinicData: any;
  onUpdate?: (data: any) => void;
}

const PublicPageSettings: React.FC<PublicPageSettingsProps> = ({ clinicData, onUpdate }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [slug, setSlug] = useState<string>('');
  const [originalSlug, setOriginalSlug] = useState<string>('');
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isSlugChecking, setIsSlugChecking] = useState<boolean>(false);
  const [lastPublishedDate, setLastPublishedDate] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  
  // Load initial data
  useEffect(() => {
    if (clinicData) {
      setSlug(clinicData.slug || '');
      setOriginalSlug(clinicData.slug || '');
      setIsPublished(clinicData.is_published || false);
      setLastPublishedDate(clinicData.last_published_at || null);
      setHasUnsavedChanges(false);
    }
  }, [clinicData]);

  // Check slug availability when it changes
  useEffect(() => {
    const checkSlugAvailability = async () => {
      if (!slug || slug === originalSlug) {
        setIsSlugAvailable(null);
        return;
      }

      setIsSlugChecking(true);
      try {
        // Check if slug is already in use by another clinic
        const { data, error } = await supabase
          .from('clinics')
          .select('id')
          .eq('slug', slug.toLowerCase())
          .neq('id', clinicData?.id || '')
          .maybeSingle();

        if (error) throw error;
        setIsSlugAvailable(!data);
      } catch (error) {
        console.error('Error checking slug availability:', error);
        setIsSlugAvailable(null);
      } finally {
        setIsSlugChecking(false);
      }
    };

    const timer = setTimeout(() => {
      checkSlugAvailability();
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, originalSlug, clinicData?.id]);

  // Handle slug change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to lowercase and replace spaces and special chars with dashes
    const newSlug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    setSlug(newSlug);
    setHasUnsavedChanges(true);
  };

  // Save changes to clinic's public page settings
  const saveChanges = async () => {
    if (!clinicData?.id || !user) return;
    
    try {
      const { error } = await supabase
        .from('clinics')
        .update({
          slug: slug,
          updated_at: new Date().toISOString()
        })
        .eq('id', clinicData.id);

      if (error) throw error;
      
      toast({
        title: "Configurações salvas",
        description: "As alterações foram salvas com sucesso.",
      });
      
      setOriginalSlug(slug);
      setHasUnsavedChanges(false);
      if (onUpdate) onUpdate({ ...clinicData, slug });
    } catch (error: any) {
      console.error('Error saving clinic settings:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive"
      });
    }
  };

  // Publish the public page
  const publishPage = async () => {
    if (!clinicData?.id || !user) return;
    
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('clinics')
        .update({
          is_published: true,
          last_published_at: now,
          updated_at: now
        })
        .eq('id', clinicData.id);

      if (error) throw error;
      
      setIsPublished(true);
      setLastPublishedDate(now);
      setHasUnsavedChanges(false);
      
      toast({
        title: "Página publicada",
        description: "Sua página pública foi publicada com sucesso.",
      });
      
      if (onUpdate) onUpdate({ 
        ...clinicData, 
        is_published: true,
        last_published_at: now
      });
    } catch (error: any) {
      console.error('Error publishing page:', error);
      toast({
        title: "Erro ao publicar",
        description: error.message || "Ocorreu um erro ao publicar a página.",
        variant: "destructive"
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="mr-2 h-5 w-5" />
          Página Pública
        </CardTitle>
        <CardDescription>
          Configure sua página pública para que pacientes possam ver informações sobre sua clínica e agendar consultas.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="url">
          <TabsList>
            <TabsTrigger value="url">URL Personalizada</TabsTrigger>
            <TabsTrigger value="visibility">Visibilidade</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="slug">URL personalizada</Label>
              <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                <div className="text-sm text-gray-500">clini.io/c/</div>
                <div className="flex-1">
                  <Input 
                    id="slug" 
                    value={slug} 
                    onChange={handleSlugChange} 
                    placeholder="sua-clinica" 
                    className={`${isSlugAvailable === false ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>
              
              <div className="h-5">
                {isSlugChecking && (
                  <p className="text-sm text-gray-500">Verificando disponibilidade...</p>
                )}
                
                {!isSlugChecking && isSlugAvailable === false && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Esta URL já está em uso. Escolha outra.
                  </p>
                )}
                
                {!isSlugChecking && isSlugAvailable === true && (
                  <p className="text-sm text-green-600 flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    URL disponível
                  </p>
                )}
              </div>
            </div>
            
            {slug && (
              <div className="pt-2">
                <Alert>
                  <Link2 className="h-4 w-4" />
                  <AlertTitle>Link da sua página pública</AlertTitle>
                  <AlertDescription className="flex flex-wrap items-center gap-2">
                    <a 
                      href={`/c/${slug}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      clini.io/c/{slug}
                    </a>
                    <Badge variant={isPublished ? "default" : "outline"}>
                      {isPublished ? 'Publicada' : 'Não publicada'}
                    </Badge>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="visibility" className="space-y-4 pt-4">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <Label htmlFor="published">Publicar página</Label>
                <p className="text-sm text-gray-500">Quando ativado, sua página será visível para todos.</p>
              </div>
              <Switch 
                id="published" 
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>
            
            {lastPublishedDate && (
              <p className="text-sm text-gray-500">
                Última publicação: {formatDate(lastPublishedDate)}
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/c/${slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-1" />
              Visualizar
            </Link>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={saveChanges}
            disabled={!hasUnsavedChanges || isSlugAvailable === false || !slug}
          >
            <Save className="h-4 w-4 mr-1" />
            Salvar
          </Button>
          <Button 
            size="sm" 
            onClick={publishPage}
            disabled={!slug || isSlugAvailable === false}
          >
            <Globe className="h-4 w-4 mr-1" />
            Publicar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PublicPageSettings;
