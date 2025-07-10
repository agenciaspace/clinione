import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogDescription as DialogDescription,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScheduleBlocks } from '@/hooks/useScheduleBlocks';
import { ScheduleBlockForm } from './ScheduleBlockForm';
import { ScheduleBlock, Doctor, ScheduleBlockFormData } from '@/types';

interface ScheduleBlockManagerProps {
  clinicId: string;
  doctors: Doctor[];
  selectedDoctorId?: string;
}

export const ScheduleBlockManager: React.FC<ScheduleBlockManagerProps> = ({
  clinicId,
  doctors,
  selectedDoctorId,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(selectedDoctorId || '');

  const {
    scheduleBlocks,
    isLoading,
    createScheduleBlock,
    updateScheduleBlock,
    deleteScheduleBlock,
    isCreating,
    isUpdating,
    isDeleting,
  } = useScheduleBlocks(clinicId, selectedDoctor);

  const handleCreateBlock = (blockData: ScheduleBlockFormData) => {
    if (!selectedDoctor) return;
    
    createScheduleBlock({
      doctorId: selectedDoctor,
      blockData,
    });
    setIsFormOpen(false);
  };

  const handleUpdateBlock = (blockData: ScheduleBlockFormData) => {
    if (!editingBlock) return;
    
    updateScheduleBlock({
      blockId: editingBlock.id,
      blockData,
    });
    setEditingBlock(null);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este bloqueio?')) {
      deleteScheduleBlock(blockId);
    }
  };

  const getBlockTypeLabel = (type: string) => {
    const labels = {
      unavailable: 'Indisponível',
      break: 'Intervalo',
      lunch: 'Almoço',
      meeting: 'Reunião',
      conference: 'Conferência',
      training: 'Treinamento',
      vacation: 'Férias',
      sick_leave: 'Licença Médica',
      personal: 'Pessoal',
      emergency: 'Emergência',
      travel: 'Viagem',
      maintenance: 'Manutenção',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getBlockTypeColor = (type: string) => {
    const colors = {
      unavailable: 'bg-gray-500',
      break: 'bg-blue-500',
      lunch: 'bg-yellow-500',
      meeting: 'bg-purple-500',
      conference: 'bg-indigo-500',
      training: 'bg-cyan-500',
      vacation: 'bg-green-500',
      sick_leave: 'bg-red-500',
      personal: 'bg-orange-500',
      emergency: 'bg-red-600',
      travel: 'bg-teal-500',
      maintenance: 'bg-slate-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.name || 'Médico não encontrado';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bloqueios de Agenda</h3>
        <Button 
          type="button"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Bloqueio
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>Criar Bloqueio de Agenda</DialogTitle>
              <DialogDescription>
                Configure um período de indisponibilidade para um médico
              </DialogDescription>
            </DialogHeader>
            <ScheduleBlockForm
              doctors={doctors}
              selectedDoctorId={selectedDoctor}
              onSubmit={handleCreateBlock}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isCreating}
              onDoctorChange={setSelectedDoctor}
            />
          </DialogContent>
        </Dialog>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {scheduleBlocks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Nenhum bloqueio de agenda encontrado
                </p>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Crie bloqueios para gerenciar a disponibilidade dos médicos
                </p>
              </CardContent>
            </Card>
          ) : (
            scheduleBlocks.map((block) => (
              <Card key={block.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getBlockTypeColor(block.block_type)}`} />
                      <div>
                        <CardTitle className="text-lg">{block.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <User className="h-4 w-4 mr-1" />
                          {getDoctorName(block.doctor_id)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {getBlockTypeLabel(block.block_type)}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingBlock(block)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBlock(block.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(block.start_datetime), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {format(new Date(block.start_datetime), 'HH:mm')} às{' '}
                      {format(new Date(block.end_datetime), 'HH:mm')}
                    </div>
                    {block.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {block.description}
                      </p>
                    )}
                    {block.is_recurring && (
                      <Badge variant="outline" className="mt-2">
                        Recorrente
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingBlock} onOpenChange={() => setEditingBlock(null)}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Editar Bloqueio de Agenda</DialogTitle>
            <DialogDescription>
              Atualize as informações do bloqueio de agenda
            </DialogDescription>
          </DialogHeader>
          {editingBlock && (
            <ScheduleBlockForm
              doctors={doctors}
              selectedDoctorId={editingBlock.doctor_id}
              initialData={editingBlock}
              onSubmit={handleUpdateBlock}
              onCancel={() => setEditingBlock(null)}
              isLoading={isUpdating}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};