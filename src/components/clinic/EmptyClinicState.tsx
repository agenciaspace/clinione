
import React from 'react';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyClinicStateProps {
  onAddClick: () => void;
}

const EmptyClinicState: React.FC<EmptyClinicStateProps> = ({ onAddClick }) => {
  return (
    <div className="text-center py-8">
      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">Sem clínicas</h3>
      <p className="mt-1 text-sm text-gray-500">
        Você ainda não tem nenhuma clínica cadastrada.
      </p>
      <div className="mt-6">
        <Button onClick={onAddClick}>
          Adicionar Clínica
        </Button>
      </div>
    </div>
  );
};

export default EmptyClinicState;
