
import React from 'react';
import { useClinic } from '@/contexts/ClinicContext';

export function DashboardHeader() {
  const { activeClinic } = useClinic();
  
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
      <p className="text-gray-500">
        {activeClinic 
          ? `Gerencie os agendamentos e consultas da clínica ${activeClinic.name}`
          : 'Selecione uma clínica para gerenciar agendamentos'
        }
      </p>
    </div>
  );
}
