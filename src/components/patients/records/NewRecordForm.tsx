
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MedicalRecordEditor } from '@/components/medical-records/MedicalRecordEditor';

interface NewRecordFormProps {
  patient: any; // Patient object with id, appointmentId, etc.
  onSubmit: (data: { content: string }) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  defaultValue?: string;
  isPending?: boolean;
  recordId?: string; // For editing existing records
}

export const NewRecordForm = ({ 
  patient,
  onSubmit, 
  onCancel, 
  onDelete, 
  isEditing = false,
  defaultValue = '',
  isPending = false,
  recordId
}: NewRecordFormProps) => {
  // Determine if this is a temporary patient from appointments
  const isTemporaryPatient = patient?.id?.startsWith('temp-');
  const appointmentId = isTemporaryPatient ? patient.id.replace('temp-', '') : undefined;
  const patientId = isTemporaryPatient ? 'temp' : patient?.id;

  const handleSave = (content: string) => {
    onSubmit({ content });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Editar Entrada' : 'Nova Entrada'}
          {isTemporaryPatient && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (Anotações da Consulta)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MedicalRecordEditor
          patientId={patientId}
          appointmentId={appointmentId}
          recordId={recordId}
          initialContent={defaultValue}
          onSave={handleSave}
          onCancel={onCancel}
          placeholder={isTemporaryPatient 
            ? "Adicione anotações sobre esta consulta..."
            : "Adicione informações ao prontuário do paciente..."
          }
          disabled={isPending}
        />
        
        {/* Additional actions for editing */}
        {isEditing && onDelete && !isTemporaryPatient && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onDelete}
                className="text-destructive hover:text-destructive/80 text-sm"
              >
                Excluir entrada permanentemente
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
