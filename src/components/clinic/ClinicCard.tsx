
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Edit, ExternalLink, Globe, Trash2, Loader2 } from 'lucide-react';
import { Clinic } from '@/types';

interface ClinicCardProps {
  clinic: Clinic;
  isActive: boolean;
  onSelect: (clinic: Clinic) => void;
  onEdit: (clinic: Clinic) => void;
  onDelete: (id: string) => void;
  onPublishToggle: (clinic: Clinic) => void;
  isPublishing: boolean;
  isDeleting: boolean;
  getPublicUrl: (slug: string) => string;
}

const ClinicCard: React.FC<ClinicCardProps> = ({
  clinic,
  isActive,
  onSelect,
  onEdit,
  onDelete,
  onPublishToggle,
  isPublishing,
  isDeleting,
  getPublicUrl
}) => {
  return (
    <Card 
      className={`flex flex-col min-h-[260px] overflow-hidden ${isActive ? 'border-primary' : ''}`}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg truncate">{clinic.name}</CardTitle>
        <CardDescription className="truncate">
          {clinic.address || 'Endereço não informado'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Telefone:</span> {clinic.phone || 'Não informado'}
          </div>
          <div className="text-sm">
            <span className="font-medium">Email:</span> {clinic.email || 'Não informado'}
          </div>
          {clinic.slug && (
            <div className="text-sm flex items-center">
              <span className="font-medium mr-1">Página Pública:</span>
              <a 
                href={getPublicUrl(clinic.slug)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center"
              >
                {clinic.slug}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
              <span className="ml-2">
                {clinic.is_published ? (
                  <span className="text-green-500 text-xs">(Publicada)</span>
                ) : (
                  <span className="text-gray-500 text-xs">(Não publicada)</span>
                )}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <div className="mt-auto p-4 bg-gray-50 flex flex-wrap gap-2 items-center justify-between">
        <div>
          {isActive ? (
            <Button variant="ghost" className="text-primary" disabled>
              <Check className="h-4 w-4 mr-2" />
              Selecionada
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onSelect(clinic)}>
              Selecionar
            </Button>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {clinic.slug && (
            <Button 
              variant={clinic.is_published ? "destructive" : "default"}
              size="sm"
              className="text-xs"
              onClick={() => onPublishToggle(clinic)}
              disabled={isPublishing || isDeleting}
            >
              {isPublishing ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Globe className="h-3 w-3 mr-1" />
              )}
              {clinic.is_published ? "Despublicar" : "Publicar"}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(clinic)}
            disabled={isDeleting}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500"
            onClick={() => onDelete(clinic.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ClinicCard;
