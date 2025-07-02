
import React from 'react';
import { Building2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface EmptyClinicStateProps {
  onAddClick: () => void;
}

const EmptyClinicState: React.FC<EmptyClinicStateProps> = ({ onAddClick }) => {
  const { isEmailVerified } = useAuth();

  return (
    <div className="text-center py-8">
      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">Sem clínicas</h3>
      <p className="mt-1 text-sm text-gray-500">
        {isEmailVerified 
          ? "Você ainda não tem nenhuma clínica cadastrada."
          : "Confirme seu email primeiro para poder cadastrar clínicas."
        }
      </p>
      <div className="mt-6">
        <Button 
          onClick={onAddClick}
          disabled={!isEmailVerified}
          variant={isEmailVerified ? "default" : "secondary"}
        >
          {isEmailVerified ? (
            "Adicionar Clínica"
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Confirme seu email primeiro
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmptyClinicState;
