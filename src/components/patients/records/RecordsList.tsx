
import React from 'react';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type RecordEntry = Tables<'patient_records'>;

interface RecordsListProps {
  records: RecordEntry[];
  isLoading: boolean;
  onEdit: (record: RecordEntry) => void;
  onViewHistory: (record: RecordEntry) => void;
}

export const RecordsList = ({ records, isLoading, onEdit, onViewHistory }: RecordsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma entrada encontrada no prontuário deste paciente
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Entradas do Prontuário</h3>
      <div className="space-y-4">
        {records.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="py-4">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-gray-500">
                  {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm')} por {entry.created_by_name || 'Sistema'}
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewHistory(entry)}
                  >
                    Histórico
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(entry)}
                  >
                    Editar
                  </Button>
                </div>
              </div>
              <div className="whitespace-pre-wrap">{entry.content}</div>
              {entry.updated_at !== entry.created_at && (
                <div className="text-xs text-gray-400 mt-2">
                  Atualizado em {format(new Date(entry.updated_at), 'dd/MM/yyyy HH:mm')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
