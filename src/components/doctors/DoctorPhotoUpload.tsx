
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface DoctorPhotoUploadProps {
  doctorId: string;
  currentPhotoUrl?: string | null;
  doctorName: string;
  onPhotoUpdated: (url: string) => void;
}

export const DoctorPhotoUpload = ({ 
  doctorId, 
  currentPhotoUrl, 
  doctorName,
  onPhotoUpdated 
}: DoctorPhotoUploadProps) => {
  console.log('DoctorPhotoUpload rendered for:', doctorName, 'ID:', doctorId);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== PHOTO UPLOAD START ===');
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    if (!file) {
      console.log('No file selected, returning');
      return;
    }

    // Validate file type
    console.log('File type:', file.type);
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type');
      toast.error('Arquivo inválido', {
        description: 'Por favor, selecione uma imagem.',
      });
      return;
    }

    // Validate file size (max 5MB)
    console.log('File size:', file.size);
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large');
      toast.error('Arquivo muito grande', {
        description: 'O tamanho máximo permitido é 5MB.',
      });
      return;
    }

    console.log('Starting upload process...');
    setIsUploading(true);
    try {
      // Delete old photo if exists
      if (currentPhotoUrl) {
        console.log('Deleting old photo:', currentPhotoUrl);
        const oldFileName = currentPhotoUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('doctor-photos')
            .remove([oldFileName]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${doctorId}-${Date.now()}.${fileExt}`;
      console.log('Uploading to path:', filePath);

      // Upload the file to Supabase storage
      console.log('Calling supabase.storage.upload...');
      const { error: uploadError } = await supabase.storage
        .from('doctor-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('Upload result - error:', uploadError);
      if (uploadError) throw uploadError;

      // Get the public URL
      console.log('Getting public URL...');
      const { data: { publicUrl } } = supabase.storage
        .from('doctor-photos')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Don't update the database here - let the parent component handle it
      // This prevents the modal from closing unexpectedly
      console.log('Calling onPhotoUpdated...');
      onPhotoUpdated(publicUrl);
      toast.success('Foto carregada! Clique em Salvar para confirmar.');
      console.log('=== PHOTO UPLOAD SUCCESS ===');

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao fazer upload', {
        description: 'Não foi possível atualizar a foto. Tente novamente.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl) return;

    setIsDeleting(true);
    try {
      // Extract filename from URL
      const fileName = currentPhotoUrl.split('/').pop();
      if (fileName) {
        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from('doctor-photos')
          .remove([fileName]);

        if (deleteError) throw deleteError;
      }

      // Don't update the database here - let the parent component handle it
      // This prevents the modal from closing unexpectedly
      onPhotoUpdated('');
      toast.success('Foto removida! Clique em Salvar para confirmar.');

    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Erro ao remover foto', {
        description: 'Não foi possível remover a foto. Tente novamente.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const initials = doctorName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Teste com useRef para forçar o input
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* TESTE MAIS DIRETO */}
      <div className="p-4 border-2 border-blue-500 bg-yellow-100">
        <h3>TESTE DE UPLOAD:</h3>
        
        <button 
          onClick={() => {
            console.log('Botão clicado!');
            fileInputRef.current?.click();
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          CLIQUE AQUI PARA SELECIONAR ARQUIVO
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            console.log('=== onChange DISPARADO ===');
            console.log('Arquivo:', e.target.files?.[0]);
            alert('SUCESSO! Arquivo selecionado: ' + (e.target.files?.[0]?.name || 'nenhum'));
            if (e.target.files?.[0]) {
              handleFileUpload(e);
            }
          }}
        />
        
        <br />
        <small>Status: {isUploading ? 'Enviando...' : 'Pronto'}</small>
      </div>
      
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-gray-200">
          <AvatarImage 
            src={currentPhotoUrl || undefined} 
            alt={doctorName}
            className="object-cover"
          />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};
