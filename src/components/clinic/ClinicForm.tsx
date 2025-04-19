import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink } from 'lucide-react';
import PhotoUpload from './PhotoUpload';
import { Clinic } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  slug: string;
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
    slug: ''
  });
  const [slugError, setSlugError] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

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
            slug: data.slug || ''
          });
          setPhoto(data.photo);
        }
      };

      fetchClinicData();
    }
  }, [isEditing, editingClinicId]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Clínica' : 'Nova Clínica'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações da sua clínica'
              : 'Preencha as informações para criar uma nova clínica'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => onSubmit(e, formData)}>
          <div className="grid gap-4 py-4">
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
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!!slugError || isCheckingSlug}>
              {isEditing ? 'Salvar alterações' : 'Criar clínica'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClinicForm;
