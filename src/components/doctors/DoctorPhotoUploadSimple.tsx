import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface DoctorPhotoUploadSimpleProps {
  doctorId: string;
  currentPhotoUrl?: string | null;
  doctorName: string;
  onPhotoUpdated: (url: string) => void;
}

export const DoctorPhotoUploadSimple = ({ 
  doctorId, 
  currentPhotoUrl, 
  doctorName,
  onPhotoUpdated 
}: DoctorPhotoUploadSimpleProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${doctorId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('doctor-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('doctor-photos')
        .getPublicUrl(fileName);

      onPhotoUpdated(publicUrl);
      toast.success('Foto carregada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar foto');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        {currentPhotoUrl ? (
          <img 
            src={currentPhotoUrl} 
            alt={doctorName} 
            className="w-32 h-32 rounded-full mx-auto object-cover"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto flex items-center justify-center">
            <span className="text-2xl text-gray-500">
              {doctorName.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      <label className="cursor-pointer inline-block">
        <span className={`px-4 py-2 rounded ${isUploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
          {isUploading ? 'Enviando...' : 'Selecionar Foto'}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={isUploading}
          className="hidden"
        />
      </label>
    </div>
  );
};