
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${doctorId}-${Date.now()}.${fileExt}`;

      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('doctor-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('doctor-photos')
        .getPublicUrl(filePath);

      onPhotoUpdated(publicUrl);

    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
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
      <Avatar className="h-24 w-24">
        <AvatarImage src={currentPhotoUrl || undefined} alt={doctorName} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="relative"
          disabled={isUploading}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            accept="image/*"
          />
          <Camera className="mr-2 h-4 w-4" />
          {isUploading ? 'Enviando...' : 'Alterar foto'}
        </Button>
      </div>
    </div>
  );
};
