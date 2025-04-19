import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink } from 'lucide-react';
import PhotoUpload from './PhotoUpload';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { WorkingHoursConfig } from '../WorkingHoursConfig';
import type { WorkingHours } from '@/types';

const defaultWorkingHours: WorkingHours = {
  monday: [{ start: '08:00', end: '18:00' }],
  tuesday: [{ start: '08:00', end: '18:00' }],
  wednesday: [{ start: '08:00', end: '18:00' }],
  thursday: [{ start: '08:00', end: '18:00' }],
  friday: [{ start: '08:00', end: '18:00' }],
  saturday: [{ start: '08:00', end: '13:00' }],
  sunday: []
};

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  slug: string;
  workingHours: WorkingHours;
}

interface ClinicFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  editingClinicId: string | null;
  onSubmit: (e: React.FormEvent, formData: ClinicFormData) => Promise<void>;
  baseUrl: string;
}

const ClinicForm: React.FC<ClinicFormProps> = ({ 
  isOpen, 
  onOpenChange, 
  isEditing, 
  editingClinicId,
  onSubmit,
  baseUrl
}) => {
  const [formData, setFormData] = useState<ClinicFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    slug: '',
    workingHours: defaultWorkingHours
  });
  
  const [activeTab, setActiveTab] = useState('basic');
  const [slugError, setSlugError] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'slug') {
      const formattedValue = value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug) return false;
    
    setIsCheckingSlug(true);
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id')
        .eq('slug', slug)
        .neq('id', editingClinicId || '');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setSlugError('Este endereço já está sendo usado por outra clínica. Tente outro nome.');
        return false;
      } else {
        setSlugError('');
        return true;
      }
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do slug:', error);
      setSlugError('Erro ao verificar disponibilidade do endereço');
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleSlugBlur = async () => {
    if (formData.slug) {
      await checkSlugAvailability(formData.slug);
    }
  };

  const getPublicUrl = (slug: string) => {
    return slug ? `${baseUrl}/c/${slug}` : '';
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(e, formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isEditing && editingClinicId) {
      const fetchClinicData = async () => {
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .eq('id', editingClinicId)
          .single();

        if (!error && data) {
          setFormData({
            name: data.name,
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            slug: data.slug || '',
            workingHours: data.working_hours || defaultWorkingHours
          });
          setPhoto(data.photo);
        }
      };

      fetchClinicData();
    }
  }, [isEditing, editingClinicId]);

  const formContent = (
    <form onSubmit={handleFormSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="schedule">Horários</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          {isEditing && editingClinicId && (
            <div className="space-y-2">
              <Label>Foto da Clínica</Label>
              <PhotoUpload
                clinicId={editingClinicId}
                currentPhoto={photo}
                onPhotoUpdate={setPhoto}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Clínica</Label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Endereço público da sua clínica</Label>
            <div className="flex">
              <span className="bg-gray-100 px-3 flex items-center border border-r-0 border-input rounded-l-md text-sm text-gray-500">
                {baseUrl}/c/
              </span>
              <Input
                id="slug"
                name="slug"
                className={`rounded-l-none ${slugError ? 'border-red-500' : ''}`}
                value={formData.slug}
                onChange={handleInputChange}
                onBlur={handleSlugBlur}
                placeholder="ex: vila-mariana-clinica"
              />
            </div>
            {slugError ? (
              <p className="text-sm text-red-500">{slugError}</p>
            ) : (
              <p className="text-sm text-gray-500">
                Este será o link usado para divulgar sua clínica online. Ele deve ser único e fácil de lembrar.
              </p>
            )}
            {formData.slug && !slugError && (
              <div className="text-sm flex items-center mt-1">
                <span className="mr-1">Ver página pública:</span>
                <a 
                  href={getPublicUrl(formData.slug)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center"
                >
                  {getPublicUrl(formData.slug)}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input 
              id="address" 
              name="address" 
              value={formData.address} 
              onChange={handleInputChange} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <WorkingHoursConfig 
            workingHours={formData.workingHours}
            onChange={(workingHours) => setFormData(prev => ({ ...prev, workingHours }))}
          />
        </TabsContent>
      </Tabs>

      <div className={`${isMobile ? "mt-6" : "mt-6"} flex justify-end space-x-2`}>
        <Button 
          variant="outline" 
          type="button" 
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={!!slugError || isCheckingSlug || isSubmitting}
        >
          {isSubmitting 
            ? 'Processando...' 
            : (isEditing ? 'Salvar alterações' : 'Criar clínica')}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!isSubmitting) onOpenChange(open);
        }}
      >
        <DrawerContent>
          <div className="container max-w-2xl mx-auto">
            <DrawerHeader className="text-center">
              <DrawerTitle>{isEditing ? 'Editar Clínica' : 'Nova Clínica'}</DrawerTitle>
              <DrawerDescription>
                {isEditing 
                  ? 'Atualize as informações da sua clínica'
                  : 'Preencha as informações para criar uma nova clínica'
                }
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              {formContent}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!isSubmitting) onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Clínica' : 'Nova Clínica'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações da sua clínica'
              : 'Preencha as informações para criar uma nova clínica'
            }
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default ClinicForm;
