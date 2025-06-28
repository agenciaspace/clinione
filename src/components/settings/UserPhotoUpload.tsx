import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Trash2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface UserPhotoUploadProps {
  userId: string;
  currentPhotoUrl?: string | null;
  userName: string;
  onPhotoUpdated: (url: string | null) => void;
}

export const UserPhotoUpload = ({ 
  userId, 
  currentPhotoUrl, 
  userName,
  onPhotoUpdated 
}: UserPhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar o tipo de arquivo - apenas PNG e JPEG
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Arquivo inválido', {
        description: 'Por favor, selecione apenas arquivos PNG ou JPEG.',
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
      const fileName = `profile-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('user-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter a URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('user-photos')
        .getPublicUrl(filePath);

      // Atualizar o perfil do usuário no banco de dados
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      onPhotoUpdated(publicUrl);
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

  const handleRemovePhoto = async () => {
    setIsRemoving(true);
    try {
      // Atualizar o perfil do usuário removendo a foto
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (updateError) throw updateError;

      onPhotoUpdated(null);
      toast.success('Foto de perfil removida com sucesso');
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      toast.error('Erro ao remover foto', {
        description: 'Não foi possível remover a foto de perfil.',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-gray-200">
          <AvatarImage src={currentPhotoUrl || undefined} alt={userName} />
          <AvatarFallback className="text-2xl bg-gray-100">
            {currentPhotoUrl ? initials : <User className="h-16 w-16 text-gray-400" />}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          className="relative"
          disabled={isUploading || isRemoving}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            accept="image/png,image/jpeg,image/jpg"
            disabled={isUploading || isRemoving}
          />
          <Camera className="mr-2 h-4 w-4" />
          {isUploading ? 'Enviando...' : 'Alterar foto'}
        </Button>
        
        {currentPhotoUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={handleRemovePhoto}
            disabled={isUploading || isRemoving}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isRemoving ? 'Removendo...' : 'Remover'}
          </Button>
        )}
      </div>
    </div>
  );
}; 