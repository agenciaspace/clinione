import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Edit, Trash2, Clock, Calendar, Shield, User } from 'lucide-react';
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
import { ScheduleBlockForm } from '@/components/appointments/ScheduleBlockForm';
import { ScheduleBlock, Doctor, ScheduleBlockFormData } from '@/types';
import { toast } from '@/components/ui/sonner';

interface DoctorScheduleBlocksProps {
  doctorId: string;
  doctorName: string;
  clinicId: string;
}

export const DoctorScheduleBlocks: React.FC<DoctorScheduleBlocksProps> = ({
  doctorId,
  doctorName,
  clinicId,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);

  const {
    scheduleBlocks,
    isLoading,
    createScheduleBlock,
    updateScheduleBlock,
    deleteScheduleBlock,
    isCreating,
    isUpdating,
    isDeleting,
  } = useScheduleBlocks(clinicId, doctorId);

  // No need to filter again since useScheduleBlocks already filters by doctorId
  const doctorBlocks = scheduleBlocks;

  const handleCreateBlock = (blockData: ScheduleBlockFormData) => {
    try {
      createScheduleBlock({
        doctorId,
        blockData,
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating block:', error);
    }
  };

  const handleEditBlock = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setIsFormOpen(true);
  };

  const handleUpdateBlock = (blockData: ScheduleBlockFormData) => {
    if (!editingBlock) return;
    
    updateScheduleBlock({
      blockId: editingBlock.id,
      blockData,
    });
    setEditingBlock(null);
    setIsFormOpen(false);
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este bloqueio?')) {
      deleteScheduleBlock(blockId);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBlock(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingBlock(null);
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

  // Create a mock doctor object for the form
  const doctorForForm: Doctor = {
    id: doctorId,
    name: doctorName,
    speciality: '',
    licensenumber: '',
    clinic_id: clinicId,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">Bloqueios de Agenda</CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerencie os períodos de indisponibilidade para {doctorName}
              </p>
            </div>
          </div>
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditingBlock(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Bloqueio
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
          <DialogContent size="lg">
              <DialogHeader>
                <DialogTitle>
                  {editingBlock ? 'Editar Bloqueio' : 'Novo Bloqueio'}
                </DialogTitle>
                <DialogDescription>
                  {editingBlock 
                    ? 'Atualize as informações do bloqueio de agenda'
                    : `Configure um período de indisponibilidade para ${doctorName}`
                  }
                </DialogDescription>
              </DialogHeader>
              <ScheduleBlockForm
                doctors={[doctorForForm]}
                selectedDoctorId={doctorId}
                initialData={editingBlock || undefined}
                onSubmit={editingBlock ? handleUpdateBlock : handleCreateBlock}
                onCancel={handleCloseForm}
                isLoading={isCreating || isUpdating}
                isEditing={!!editingBlock}
              />
          </DialogContent>
        </Dialog>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : doctorBlocks.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum bloqueio de agenda encontrado
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie bloqueios para gerenciar a disponibilidade de {doctorName}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctorBlocks.map((block) => (
              <Card key={block.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getBlockTypeColor(block.block_type)}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold">{block.title}</h4>
                        {block.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {block.description}
                          </p>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground mt-2 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(block.start_datetime), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {format(new Date(block.start_datetime), 'HH:mm')} às{' '}
                            {format(new Date(block.end_datetime), 'HH:mm')}
                          </div>
                        </div>
                        {block.is_recurring && (
                          <Badge variant="outline" className="mt-2">
                            Recorrente
                          </Badge>
                        )}
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditBlock(block);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteBlock(block.id);
                        }}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};