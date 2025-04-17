
import React from 'react';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PatientInfoProps {
  patient: Tables<'patients'>;
}

export const PatientInfo = ({ patient }: PatientInfoProps) => {
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
            <p className="text-base">{format(new Date(patient.birth_date), 'dd/MM/yyyy')}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <p className="text-base">{patient.status === 'active' ? 'Ativo' : 'Inativo'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
