import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Edit, ExternalLink, Globe, Trash2, Loader2, Mail } from 'lucide-react';
import { Clinic } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

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
  const { isEmailVerified } = useAuth();
  return (
    <Card 
      className={`flex flex-col min-h-[260px] overflow-hidden ${isActive ? 'border-primary' : ''}`}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg truncate text-foreground">
          {clinic.name}
        </CardTitle>
        <CardDescription className="truncate text-muted-foreground">
          {clinic.address || 'Endereço não informado'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Telefone:</span>
          <span>{clinic.phone || 'Não informado'}</span>

          <span className="font-medium text-foreground">Email:</span>
          <span className="break-all">{clinic.email || 'Não informado'}</span>

          {clinic.slug && (
            <div className="sm:col-span-2 flex items-center flex-wrap gap-1">
              <span className="font-medium text-foreground">Página Pública:</span>
              <a
                href={getPublicUrl(clinic.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center truncate max-w-[140px]"
              >
                {clinic.slug}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
              {clinic.is_published ? (
                <span className="text-green-500 text-xs dark:text-green-400">(Publicada)</span>
              ) : (
                <span className="text-gray-500 text-xs dark:text-gray-400">(Não publicada)</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <div className="mt-auto p-4 bg-gray-50 dark:bg-muted flex flex-wrap gap-2 items-center justify-between">
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
              disabled={isPublishing || isDeleting || !isEmailVerified}
              title={!isEmailVerified ? "Confirme seu email primeiro" : undefined}
            >
              {isPublishing ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : !isEmailVerified ? (
                <Mail className="h-3 w-3 mr-1" />
              ) : (
                <Globe className="h-3 w-3 mr-1" />
              )}
              {!isEmailVerified ? "Email" : clinic.is_published ? "Despublicar" : "Publicar"}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(clinic)}
            disabled={isDeleting || !isEmailVerified}
            title={!isEmailVerified ? "Confirme seu email primeiro" : "Editar clínica"}
          >
            {!isEmailVerified ? <Mail className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500"
            onClick={() => onDelete(clinic.id)}
            disabled={isDeleting || !isEmailVerified}
            title={!isEmailVerified ? "Confirme seu email primeiro" : "Excluir clínica"}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : !isEmailVerified ? (
              <Mail className="h-4 w-4" />
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
