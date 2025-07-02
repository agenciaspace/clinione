
import React, { useState } from 'react';
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { PatientRecordTabs } from './PatientRecordTabs';
import { PatientRecordDialogFooter } from './PatientRecordDialogFooter';
import { PatientRecordDialogDeleteEntry } from './PatientRecordDialogDeleteEntry';
import { useCreateRecord, useUpdateRecord, useDeleteRecord } from './PatientRecordMutations';

interface Props {
  patient: any;
  onClose: () => void;
  currentUser: any;
}

const PatientRecordMain: React.FC<Props> = ({ patient, onClose, currentUser }) => {
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const patientId = patient.id;

  // Query for record entries
  const { data: recordEntries = [], isLoading: isLoadingRecords, error: recordsError } = useQuery({
    queryKey: ['patientRecords', patientId],
    queryFn: async () => {
      // Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('patient_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar prontuário:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // If it's a permission error, show a more specific message
        if (error.code === '42501' || error.message.includes('403')) {
          throw new Error('Sem permissão para acessar prontuários. Verifique suas credenciais.');
        }
        
        throw error;
      }
      return data || [];
    },
    retry: (failureCount, error) => {
      // Don't retry permission errors
      if (error?.message?.includes('403') || error?.message?.includes('permission')) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Audit
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
    enabled: !!activeEntry?.id && isViewingHistory,
  });

  // Mutations
  const createRecordMutation = useCreateRecord(patientId, currentUser);
  const updateRecordMutation = useUpdateRecord(patientId, activeEntry, currentUser);
  const deleteRecordMutation = useDeleteRecord(patientId, activeEntry, currentUser);

  const handleSubmit = async (data: { content: string }) => {
    if (activeEntry) {
      updateRecordMutation.mutate({ id: activeEntry.id, content: data.content });
      setActiveEntry(null);
    } else {
      createRecordMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (activeEntry) {
      deleteRecordMutation.mutate(activeEntry.id, {
        onSettled: () => {
          setActiveEntry(null);
          setIsConfirmDialogOpen(false);
        }
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">
          Prontuário do Paciente: {patient.name}
        </DialogTitle>
      </DialogHeader>
      <div className="mt-6">
        <PatientRecordTabs
          patient={patient}
          activeEntry={activeEntry}
          setActiveEntry={(e) => {
            setActiveEntry(e);
            setIsViewingHistory(false);
          }}
          isViewingHistory={isViewingHistory}
          setIsViewingHistory={setIsViewingHistory}
          recordEntries={recordEntries}
          isLoadingRecords={isLoadingRecords}
          auditLogs={auditLogs}
          isLoadingAuditLog={isLoadingAuditLog}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          isEditing={!!activeEntry}
          defaultValue={activeEntry?.content}
          isPending={createRecordMutation.isPending || updateRecordMutation.isPending}
        />
      </div>
      <DialogFooter>
        <PatientRecordDialogFooter onClose={onClose} />
      </DialogFooter>
      <PatientRecordDialogDeleteEntry
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default PatientRecordMain;
