
import React, { useState } from 'react';
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tables } from '@/integrations/supabase/types';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { NewRecordForm } from './records/NewRecordForm';
import { RecordHistory } from './records/RecordHistory';
import { RecordsList } from './records/RecordsList';
import { PatientInfo } from './records/PatientInfo';

interface PatientRecordProps {
  patient: Tables<'patients'>['Row'];
  onClose: () => void;
  currentUser: any;
}

export const PatientRecord: React.FC<PatientRecordProps> = ({ patient, onClose, currentUser }) => {
  const queryClient = useQueryClient();
  const [activeEntry, setActiveEntry] = useState<Tables<'patient_records'>['Row'] | null>(null);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Consultar entradas de prontuário
  const { data: recordEntries = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ['patientRecords', patient.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_records')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar prontuário:', error);
        toast.error('Falha ao carregar prontuário do paciente');
        return [];
      }

      return data;
    }
  });

  // Consultar histórico de alterações
  const { data: auditLogs = [], isLoading: isLoadingAuditLog } = useQuery({
    queryKey: ['patientRecordAudit', activeEntry?.id],
    queryFn: async () => {
      if (!activeEntry?.id) return [];

      const { data, error } = await supabase
        .from('patient_record_audit')
        .select('*')
        .eq('record_id', activeEntry.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        toast.error('Falha ao carregar histórico do prontuário');
        return [];
      }

      return data;
    },
    enabled: !!activeEntry?.id && isViewingHistory
  });

  // Mutation para criar nova entrada
  const createRecordMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const newRecord = {
        patient_id: patient.id,
        content,
        created_by: currentUser?.id || 'sistema',
        created_by_name: currentUser?.email?.split('@')[0] || 'Sistema'
      };

      const { data, error } = await supabase
        .from('patient_records')
        .insert([newRecord])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientRecords', patient.id] });
      toast.success('Prontuário atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao criar entrada:', error);
      toast.error('Falha ao atualizar prontuário');
    }
  });

  // Mutation para atualizar entrada
  const updateRecordMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data: currentRecord } = await supabase
        .from('patient_records')
        .select('content')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('patient_records')
        .update({ 
          content, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      await supabase
        .from('patient_record_audit')
        .insert([{
          record_id: id,
          action: 'update',
          content_before: currentRecord?.content,
          content_after: content,
          user_id: currentUser?.id || 'sistema',
          user_name: currentUser?.email?.split('@')[0] || 'Sistema'
        }]);

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientRecords', patient.id] });
      queryClient.invalidateQueries({ queryKey: ['patientRecordAudit', activeEntry?.id] });
      toast.success('Prontuário atualizado com sucesso');
      setActiveEntry(null);
    },
    onError: (error) => {
      console.error('Erro ao atualizar entrada:', error);
      toast.error('Falha ao atualizar prontuário');
    }
  });

  // Mutation para deletar entrada
  const deleteRecordMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: currentRecord } = await supabase
        .from('patient_records')
        .select('content')
        .eq('id', id)
        .single();

      await supabase
        .from('patient_record_audit')
        .insert([{
          record_id: id,
          action: 'delete',
          content_before: currentRecord?.content,
          user_id: currentUser?.id || 'sistema',
          user_name: currentUser?.email?.split('@')[0] || 'Sistema'
        }]);

      const { error } = await supabase
        .from('patient_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientRecords', patient.id] });
      toast.success('Entrada removida com sucesso');
      setActiveEntry(null);
      setIsConfirmDialogOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao deletar entrada:', error);
      toast.error('Falha ao remover entrada do prontuário');
      setIsConfirmDialogOpen(false);
    }
  });

  const handleSubmit = async (data: { content: string }) => {
    if (activeEntry) {
      updateRecordMutation.mutate({ id: activeEntry.id, content: data.content });
    } else {
      createRecordMutation.mutate(data);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">Prontuário do Paciente: {patient.name}</DialogTitle>
      </DialogHeader>

      <div className="mt-6">
        <Tabs defaultValue="record" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="record">Prontuário</TabsTrigger>
            <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
          </TabsList>

          <TabsContent value="record">
            <div className="space-y-6">
              {!isViewingHistory && (
                <NewRecordForm
                  onSubmit={handleSubmit}
                  onCancel={() => setActiveEntry(null)}
                  onDelete={() => setIsConfirmDialogOpen(true)}
                  isEditing={!!activeEntry}
                  defaultValue={activeEntry?.content}
                  isPending={createRecordMutation.isPending || updateRecordMutation.isPending}
                />
              )}

              {isViewingHistory && activeEntry && (
                <RecordHistory
                  auditLogs={auditLogs}
                  isLoading={isLoadingAuditLog}
                  onClose={() => setIsViewingHistory(false)}
                />
              )}

              <RecordsList
                records={recordEntries}
                isLoading={isLoadingRecords}
                onEdit={handleEditEntry}
                onViewHistory={handleViewHistory}
              />
            </div>
          </TabsContent>

          <TabsContent value="info">
            <PatientInfo patient={patient} />
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </DialogFooter>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta entrada do prontuário? Esta ação será registrada no histórico mas não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => activeEntry && deleteRecordMutation.mutate(activeEntry.id)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PatientRecord;
