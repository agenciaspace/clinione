
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Plus, Mail } from 'lucide-react';

const NoClinicSelected: React.FC = () => {
  const navigate = useNavigate();
  const { isEmailVerified } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Building2 className="h-8 w-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Nenhuma clínica selecionada</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        {isEmailVerified 
          ? "Você precisa criar ou selecionar uma clínica para acessar as funcionalidades do sistema."
          : "Confirme seu email primeiro, depois você poderá criar ou selecionar uma clínica."
        }
      </p>
      <Button 
        onClick={() => navigate('/dashboard/clinic')}
        disabled={!isEmailVerified}
        className="flex items-center"
        variant={isEmailVerified ? "default" : "secondary"}
      >
        {isEmailVerified ? (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Gerenciar clínicas
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Confirme seu email primeiro
          </>
        )}
      </Button>
    </div>
  );
};

export default NoClinicSelected;
