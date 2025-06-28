import React from 'react';
import { WorkingHoursConfig } from '@/components/WorkingHoursConfig';
import { WorkingHours } from '@/types';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

interface DoctorWorkingHoursProps {
  workingHours: WorkingHours;
  onChange: (workingHours: WorkingHours) => void;
  doctorName?: string;
}

export const DoctorWorkingHours = ({ 
  workingHours, 
  onChange, 
  doctorName 
}: DoctorWorkingHoursProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-blue-500" />
        <Label className="text-sm font-medium">
          Horários de Atendimento
          {doctorName && (
            <span className="text-gray-500 font-normal"> - {doctorName}</span>
          )}
        </Label>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border">
        <p className="text-xs text-gray-600 mb-3">
          Configure os horários individuais deste profissional. 
          Estes horários têm prioridade sobre os horários gerais da clínica.
        </p>
        
        <WorkingHoursConfig
          workingHours={workingHours}
          onChange={onChange}
        />
      </div>
      
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
        <strong>💡 Dica:</strong> Os horários padrão são das 09:00 às 18:00 (seg-sex) e 09:00 às 13:00 (sáb). 
        Você pode personalizar conforme necessário.
      </div>
    </div>
  );
}; 