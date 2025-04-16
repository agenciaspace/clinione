
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';

const NoClinicSelected: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Building2 className="h-8 w-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Nenhuma clínica selecionada</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Você precisa criar ou selecionar uma clínica para acessar as funcionalidades do sistema.
      </p>
      <Button 
        onClick={() => navigate('/dashboard/clinic')}
        className="flex items-center"
      >
        <Plus className="mr-2 h-4 w-4" />
        Gerenciar clínicas
      </Button>
    </div>
  );
};

export default NoClinicSelected;
