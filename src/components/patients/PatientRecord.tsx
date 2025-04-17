import React, { useState, useEffect } from 'react';
import { 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Tables } from '@/integrations/supabase/types';

interface PatientRecordProps {
  patient: Tables['patients']['Row'];
  onClose: () => void;
  currentUser: any;
}

type RecordEntry = Tables['patient_records']['Row'];
type RecordAuditLog = Tables['patient_record_audit']['Row'];

const recordEntrySchema = z.object({
  content: z.string().min(1, { message: 'O conteúdo do prontuário não pode ficar vazio.' })
});

const PatientRecord: React.FC<PatientRecordProps> = ({ patient, onClose, currentUser }) => {
  const queryClient = useQueryClient();
  const [activeEntry, setActiveEntry] = useState<RecordEntry | null>(null);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof recordEntrySchema>>({
    resolver: zodResolver(recordEntrySchema),
    defaultValues: {
      content: activeEntry?.content || ''
    }
  });

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
    mutationFn: async (content: string) => {
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
      form.reset({ content: '' });
    },
    onError: (error) => {
      console.error('Erro ao criar entrada:', error);
      toast.error('Falha ao atualizar prontuário');
    }
  });

  // Mutation para atualizar entrada
  const updateRecordMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      // Primeiro, vamos buscar o conteúdo atual para registrar na auditoria
      const { data: currentRecord } = await supabase
        .from('patient_records')
        .select('content')
        .eq('id', id)
        .single();

      // Atualizar o registro
      const { data, error } = await supabase
        .from('patient_records')
        .update({ 
          content, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      // Criar um registro de auditoria
      const auditLog = {
        record_id: id,
        action: 'update',
        content_before: currentRecord?.content,
        content_after: content,
        user_id: currentUser?.id || 'sistema',
        user_name: currentUser?.email?.split('@')[0] || 'Sistema'
      };

      await supabase
        .from('patient_record_audit')
        .insert([auditLog]);

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientRecords', patient.id] });
      queryClient.invalidateQueries({ queryKey: ['patientRecordAudit', activeEntry?.id] });
      toast.success('Prontuário atualizado com sucesso');
      setActiveEntry(null);
      form.reset({ content: '' });
    },
    onError: (error) => {
      console.error('Erro ao atualizar entrada:', error);
      toast.error('Falha ao atualizar prontuário');
    }
  });

  // Mutation para deletar entrada
  const deleteRecordMutation = useMutation({
    mutationFn: async (id: string) => {
      // Primeiro, vamos buscar o conteúdo atual para registrar na auditoria
      const { data: currentRecord } = await supabase
        .from('patient_records')
        .select('content')
        .eq('id', id)
        .single();

      // Criar um registro de auditoria antes de deletar
      const auditLog = {
        record_id: id,
        action: 'delete',
        content_before: currentRecord?.content,
        user_id: currentUser?.id || 'sistema',
        user_name: currentUser?.email?.split('@')[0] || 'Sistema'
      };

      await supabase
        .from('patient_record_audit')
        .insert([auditLog]);

      // Agora deletar o registro
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
      form.reset({ content: '' });
    },
    onError: (error) => {
      console.error('Erro ao deletar entrada:', error);
      toast.error('Falha ao remover entrada do prontuário');
      setIsConfirmDialogOpen(false);
    }
  });

  // Atualizar formulário quando uma entrada for selecionada para edição
  useEffect(() => {
    if (activeEntry) {
      form.setValue('content', activeEntry.content);
    } else {
      form.setValue('content', '');
    }
  }, [activeEntry, form]);

  const handleSubmit = form.handleSubmit((data) => {
    if (activeEntry) {
      updateRecordMutation.mutate({ 
        id: activeEntry.id, 
        content: data.content 
      });
    } else {
      createRecordMutation.mutate(data.content);
    }
  });

  const handleEditEntry = (entry: RecordEntry) => {
    setIsViewingHistory(false);
    setActiveEntry(entry);
  };

  const handleViewHistory = (entry: RecordEntry) => {
    setActiveEntry(entry);
    setIsViewingHistory(true);
  };

  const handleDeleteEntry = () => {
    if (activeEntry) {
      deleteRecordMutation.mutate(activeEntry.id);
    }
  };

  const handleCancel = () => {
    setActiveEntry(null);
    setIsViewingHistory(false);
    form.reset({ content: '' });
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
                <Card>
                  <CardHeader>
                    <CardTitle>{activeEntry ? 'Editar Entrada' : 'Nova Entrada'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Anotações do Prontuário</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Adicione informações ao prontuário do paciente..."
                                  className="min-h-[150px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2">
                          {activeEntry && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setIsConfirmDialogOpen(true)}
                              >
                                Excluir
                              </Button>
                            </>
                          )}
                          <Button 
                            type="submit" 
                            disabled={createRecordMutation.isPending || updateRecordMutation.isPending}
                          >
                            {activeEntry ? 'Atualizar' : 'Salvar'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {isViewingHistory && activeEntry && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Histórico de Alterações</span>
                      <Button variant="outline" onClick={() => setIsViewingHistory(false)}>
                        Voltar
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAuditLog ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : auditLogs.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Nenhum histórico de alteração encontrado
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {auditLogs.map((log: RecordAuditLog) => (
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
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Entradas do Prontuário</h3>
                {isLoadingRecords ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : recordEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma entrada encontrada no prontuário deste paciente
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recordEntries.map((entry: RecordEntry) => (
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
                                onClick={() => handleViewHistory(entry)}
                              >
                                Histórico
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditEntry(entry)}
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
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Nome</h3>
                    <p className="text-base">{patient.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                    <p className="text-base">{patient.email || 'Não informado'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Telefone</h3>
                    <p className="text-base">{patient.phone || 'Não informado'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Data de Nascimento</h3>
                    <p className="text-base">{format(new Date(patient.birthDate), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                    <p className="text-base">{patient.status === 'active' ? 'Ativo' : 'Inativo'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            <AlertDialogAction onClick={handleDeleteEntry}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PatientRecord;
