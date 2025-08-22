import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Loader2 } from 'lucide-react';

interface DoctorPhotoUploadCleanProps {
  doctorId: string;
  currentPhotoUrl?: string | null;
  doctorName: string;
  onPhotoUpdated: (url: string) => void;
}

export const DoctorPhotoUploadClean = ({ 
  doctorId, 
  currentPhotoUrl, 
  doctorName,
  onPhotoUpdated 
}: DoctorPhotoUploadCleanProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageKey, setImageKey] = useState(0); // Force image re-render
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when currentPhotoUrl changes
  React.useEffect(() => {
    setLocalPhotoUrl(currentPhotoUrl);
  }, [currentPhotoUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${doctorId}-${Date.now()}.${fileExt}`;

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('doctor-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('doctor-photos')
        .getPublicUrl(fileName);

      // Update local state immediately and parent component
      setLocalPhotoUrl(publicUrl);
      setImageKey(prev => prev + 1); // Force image refresh
      onPhotoUpdated(publicUrl);
      toast.success('Foto carregada com sucesso!');

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao carregar foto');
    } finally {
      setIsUploading(false);
      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const initials = doctorName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-gray-200">
          <AvatarImage 
            src={localPhotoUrl ? `${localPhotoUrl}?v=${imageKey}&t=${Date.now()}` : undefined} 
            alt={doctorName}
            className="object-cover"
            key={`${localPhotoUrl}-${imageKey}`} // Force re-render when URL or key changes
          />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <Camera className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Upload button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => {
            fileInputRef.current?.click();
          }}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {localPhotoUrl ? 'Alterar foto' : 'Adicionar foto'}
            </>
          )}
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Formatos aceitos: JPG, PNG, GIF<br />
        Tamanho máximo: 5MB
      </p>
    </div>
  );
};