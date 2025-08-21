import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shield, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScheduleBlocks } from '@/hooks/useScheduleBlocks';
import { Doctor } from '@/types';

interface ScheduleBlocksListProps {
  clinicId: string;
  selectedDate: Date;
  selectedDoctor?: string;
  doctors: Doctor[];
}

export const ScheduleBlocksList: React.FC<ScheduleBlocksListProps> = ({
  clinicId,
  selectedDate,
  selectedDoctor,
  doctors
}) => {
  const { getBlocksForDateRange } = useScheduleBlocks(clinicId, selectedDoctor);

  const dateStart = new Date(selectedDate);
  dateStart.setHours(0, 0, 0, 0);
  
  const dateEnd = new Date(selectedDate);
  dateEnd.setHours(23, 59, 59, 999);
  
  const todayBlocks = getBlocksForDateRange(
    dateStart.toISOString(),
    dateEnd.toISOString(),
    selectedDoctor && selectedDoctor !== 'all' ? selectedDoctor : undefined
  );

  const getBlockTypeLabel = (type: string) => {
    const labels = {
      unavailable: 'Indisponível',
      break: 'Intervalo',
      meeting: 'Reunião',
      vacation: 'Férias',
      sick_leave: 'Licença Médica',
      personal: 'Pessoal',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getBlockTypeColor = (type: string) => {
    const colors = {
      unavailable: 'bg-gray-500',
      break: 'bg-blue-500',
      meeting: 'bg-purple-500',
      vacation: 'bg-green-500',
      sick_leave: 'bg-red-500',
      personal: 'bg-orange-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.name || 'Médico não encontrado';
  };

  if (todayBlocks.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Shield className="h-5 w-5 mr-2 text-red-500" />
          Bloqueios Ativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todayBlocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getBlockTypeColor(block.block_type)}`} />
                <div>
                  <p className="font-medium text-sm">{block.title}</p>
                  <div className="flex items-center text-xs text-gray-600 mt-1">
                    <User className="h-3 w-3 mr-1" />
                    {getDoctorName(block.doctor_id)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-1">
                  {getBlockTypeLabel(block.block_type)}
                </Badge>
                <div className="flex items-center text-xs text-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(block.start_datetime), 'HH:mm')} às{' '}
                  {format(new Date(block.end_datetime), 'HH:mm')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};