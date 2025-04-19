
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { WorkingHours as WorkingHoursType } from '@/types';
import { AppointmentScheduler } from './AppointmentScheduler';

interface WorkingHoursProps {
  workingHours: WorkingHoursType | null;
  clinicId: string;
}

const weekdayNames = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo"
};

export const WorkingHoursComponent = ({ workingHours, clinicId }: WorkingHoursProps) => {
  const [open, setOpen] = React.useState(false);
  
  if (!workingHours) {
    return <p className="text-gray-500">Horários não disponíveis</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-blue-500" />
        Horário de Funcionamento
      </h2>
      
      <div className="space-y-2">
        {Object.entries(workingHours).map(([day, periods]) => {
          const dayName = weekdayNames[day as keyof typeof weekdayNames];
          
          return (
            <div key={day} className="flex justify-between items-center">
              <span className="text-gray-600">{dayName}</span>
              <span className="font-medium">
                {periods && periods.length > 0 
                  ? `${periods[0].start} - ${periods[0].end}`
                  : "Fechado"}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6">
        <AppointmentScheduler 
          clinicId={clinicId}
          trigger={
            <Button variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Agendar Consulta
            </Button>
          } 
        />
      </div>
    </div>
  );
};
