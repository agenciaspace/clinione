
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { WorkingHours } from '@/types';

interface WorkingHoursConfigProps {
  workingHours: WorkingHours;
  onChange: (workingHours: WorkingHours) => void;
}

const daysOfWeek = [
  { id: 'monday', label: 'Segunda-feira' },
  { id: 'tuesday', label: 'Terça-feira' },
  { id: 'wednesday', label: 'Quarta-feira' },
  { id: 'thursday', label: 'Quinta-feira' },
  { id: 'friday', label: 'Sexta-feira' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
] as const;

export const WorkingHoursConfig: React.FC<WorkingHoursConfigProps> = ({
  workingHours,
  onChange,
}) => {
  const handleAddPeriod = (day: keyof WorkingHours) => {
    const newWorkingHours = { ...workingHours };
    newWorkingHours[day] = [
      ...(newWorkingHours[day] || []),
      { start: '09:00', end: '17:00' },
    ];
    onChange(newWorkingHours);
  };

  const handleRemovePeriod = (day: keyof WorkingHours, index: number) => {
    const newWorkingHours = { ...workingHours };
    newWorkingHours[day] = newWorkingHours[day]?.filter((_, i) => i !== index) || [];
    onChange(newWorkingHours);
  };

  const handlePeriodChange = (
    day: keyof WorkingHours,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    const newWorkingHours = { ...workingHours };
    if (!newWorkingHours[day]) {
      newWorkingHours[day] = [];
    }
    if (!newWorkingHours[day][index]) {
      newWorkingHours[day][index] = { start: '09:00', end: '17:00' };
    }
    newWorkingHours[day][index][field] = value;
    onChange(newWorkingHours);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Horário de Funcionamento</h3>
      
      {daysOfWeek.map(({ id, label }) => (
        <div key={id} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{label}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddPeriod(id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Horário
            </Button>
          </div>
          
          <div className="space-y-2">
            {workingHours[id]?.map((period, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="time"
                  value={period.start}
                  onChange={(e) =>
                    handlePeriodChange(id, index, 'start', e.target.value)
                  }
                  className="w-32"
                />
                <span>até</span>
                <Input
                  type="time"
                  value={period.end}
                  onChange={(e) =>
                    handlePeriodChange(id, index, 'end', e.target.value)
                  }
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePeriod(id, index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(!workingHours[id] || workingHours[id].length === 0) && (
              <p className="text-sm text-muted-foreground">Fechado</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
