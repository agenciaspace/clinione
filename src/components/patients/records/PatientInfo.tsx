
import React from 'react';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Patient } from '@/types';

interface PatientInfoProps {
  patient: Patient | Tables<'patients'>;
}

export const PatientInfo = ({ patient }: PatientInfoProps) => {
  // Formatação da data de nascimento considerando ambos os formatos possíveis
  const formatBirthDate = () => {
    try {
      // birthDate é usado no tipo Patient
      if ('birthDate' in patient) {
        return format(new Date(patient.birthDate), 'dd/MM/yyyy');
      }
      // birth_date é usado no tipo Tables<'patients'>
      return format(new Date(patient.birth_date), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Função auxiliar para determinar o status do paciente
  const getPatientStatus = (): string => {
    // Se for do tipo Patient da aplicação
    if ('status' in patient) {
      return patient.status;
    }
    // Se for do tipo Tables<'patients'> do Supabase
    return patient.status || 'active';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Nome</h3>
            <p className="text-base">{patient.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
            <p className="text-base">{patient.email || 'Não informado'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Telefone</h3>
            <p className="text-base">{patient.phone || 'Não informado'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Data de Nascimento</h3>
            <p className="text-base">{formatBirthDate()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <p className="text-base">{getPatientStatus() === 'active' ? 'Ativo' : 'Inativo'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
