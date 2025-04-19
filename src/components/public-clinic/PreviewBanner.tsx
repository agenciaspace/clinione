
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PreviewBannerProps {
  isPublished: boolean | null;
  publicUrl: string;
  selectedClinicId: string | null;
  availableClinics: { id: string; name: string }[];
  onClinicChange: (value: string) => void;
}

export const PreviewBanner = ({
  isPublished,
  publicUrl,
  selectedClinicId,
  availableClinics,
  onClinicChange
}: PreviewBannerProps) => {
  return (
    <div className="bg-blue-500 text-white text-center py-2">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="mb-2 md:mb-0">
              Modo de Pré-visualização {isPublished 
                ? <span>Esta página está publicada em <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="underline">{publicUrl}</a></span> 
                : "Esta página ainda não está publicada."}
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            {availableClinics.length > 0 && (
              <div className="flex items-center">
                <select
                  className="px-2 py-1 rounded text-blue-500 border-none"
                  value={selectedClinicId || ''}
                  onChange={(e) => onClinicChange(e.target.value)}
                >
                  {availableClinics.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <Button variant="outline" className="bg-white text-blue-500" asChild>
              <Link to="/dashboard/clinic">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Editar
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
