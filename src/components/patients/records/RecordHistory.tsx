
import React from 'react';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type RecordAuditLog = Tables<'patient_record_audit'>;

interface RecordHistoryProps {
  auditLogs: RecordAuditLog[];
  isLoading: boolean;
  onClose: () => void;
}

export const RecordHistory = ({ auditLogs, isLoading, onClose }: RecordHistoryProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum histórico de alteração encontrado
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Histórico de Alterações</span>
          <Button variant="outline" onClick={onClose}>
            Voltar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="py-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium">
                    {log.action === 'create' ? 'Criação' : 
                     log.action === 'update' ? 'Edição' : 'Exclusão'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')} por {log.user_name}
                  </div>
                </div>

                {log.action === 'update' && (
                  <div className="grid gap-4 mt-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Antes:</div>
                      <div className="p-3 bg-gray-50 rounded-md text-sm">
                        {log.content_before || '(vazio)'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Depois:</div>
                      <div className="p-3 bg-gray-100 rounded-md text-sm">
                        {log.content_after || '(vazio)'}
                      </div>
                    </div>
                  </div>
                )}

                {log.action === 'delete' && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-500 mb-1">Conteúdo excluído:</div>
                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                      {log.content_before || '(vazio)'}
                    </div>
                  </div>
                )}

                {log.action === 'create' && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-500 mb-1">Conteúdo criado:</div>
                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                      {log.content_after || '(vazio)'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
