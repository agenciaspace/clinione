
import React, { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PhotoUploadProps {
  clinicId: string;
  currentPhoto: string | null;
  onPhotoUpdate: (photoUrl: string) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ clinicId, currentPhoto, onPhotoUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar o tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido', {
        description: 'Por favor, selecione uma imagem.',
      });
      return;
    }

    // Validar o tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande', {
        description: 'O tamanho máximo permitido é 5MB.',
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${clinicId}-clinic-photo-${Date.now()}.${fileExt}`;
      const filePath = `${clinicId}/${fileName}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('clinic-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter a URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('clinic-photos')
        .getPublicUrl(filePath);

      // Atualizar a clínica com a nova foto
      const { error: updateError } = await supabase
        .from('clinics')
        .update({ photo: publicUrl })
        .eq('id', clinicId);

      if (updateError) throw updateError;

      onPhotoUpdate(publicUrl);
      toast.success('Foto de perfil atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload', {
        description: 'Não foi possível atualizar a foto de perfil.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {currentPhoto && (
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
          <img
            src={currentPhoto}
            alt="Foto de perfil da clínica"
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}
      <div className="flex justify-center">
        <Button
          variant="outline"
          disabled={isUploading}
          className="relative"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('photo-upload')?.click();
          }}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Enviando...' : 'Alterar foto de perfil'}
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
            onClick={(e) => e.stopPropagation()}
          />
        </Button>
      </div>
    </div>
  );
};

export default PhotoUpload;
