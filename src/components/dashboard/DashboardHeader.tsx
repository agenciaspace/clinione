import React from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar } from 'lucide-react';

export function DashboardHeader() {
  const { activeClinic } = useClinic();
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <Calendar className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground`}>
          Agenda
        </h1>
      </div>
      <p className={`${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground`}>
        {activeClinic 
          ? `Gerencie os agendamentos e consultas da clínica ${activeClinic.name}`
          : 'Selecione uma clínica para gerenciar agendamentos'
        }
      </p>
    </div>
  );
}
