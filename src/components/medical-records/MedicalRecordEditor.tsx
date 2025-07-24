import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMedicalRecordAutoSave } from '@/hooks/useMedicalRecordAutoSave';
import { Save, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MedicalRecordEditorProps {
  patientId: string;
  appointmentId?: string;
  recordId?: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  onContentChange?: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  disabled?: boolean;
  clinicId?: string;
}

export const MedicalRecordEditor: React.FC<MedicalRecordEditorProps> = ({
  patientId,
  appointmentId,
  recordId,
  initialContent = '',
  onSave,
  onCancel,
  onContentChange,
  placeholder = 'Digite as informações do prontuário...',
  disabled = false,
  clinicId
}) => {
  const [isManualSaving, setIsManualSaving] = useState(false);

  const {
    content,
    updateContent,
    manualSave,
    clearDraft,
    saveStatus,
    lastSaved,
    isDraftLoaded
  } = useMedicalRecordAutoSave({
    patientId,
    appointmentId,
    recordId,
    initialContent,
    clinicId
  });

  const handleManualSave = async () => {
    if (!content.trim()) {
      return;
    }

    setIsManualSaving(true);
    try {
      await manualSave();
      onSave?.(content);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsManualSaving(false);
    }
  };

  const handleCancel = () => {
    clearDraft();
    onCancel?.();
  };

  const getSaveStatusInfo = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Salvando...',
          variant: 'secondary' as const
        };
      case 'saved':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: lastSaved ? `Salvo ${format(lastSaved, 'HH:mm', { locale: ptBR })}` : 'Salvo',
          variant: 'secondary' as const
        };
      case 'draft':
        return {
          icon: <Clock className="h-3 w-3" />,
          text: 'Rascunho',
          variant: 'outline' as const
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'Erro ao salvar',
          variant: 'destructive' as const
        };
      default:
        return null;
    }
  };

  const statusInfo = getSaveStatusInfo();

  if (!isDraftLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          {statusInfo && (
            <Badge variant={statusInfo.variant} className="flex items-center space-x-1">
              {statusInfo.icon}
              <span>{statusInfo.text}</span>
            </Badge>
          )}
          {saveStatus === 'draft' && (
            <span className="text-muted-foreground">
              Salvamento automático em alguns segundos...
            </span>
          )}
        </div>
        
        {lastSaved && saveStatus === 'saved' && (
          <span className="text-muted-foreground">
            Última sincronização: {format(lastSaved, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        )}
      </div>

      {/* Editor */}
      <div className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => {
            updateContent(e.target.value);
            onContentChange?.(e.target.value);
          }}
          placeholder={placeholder}
          className="min-h-[200px] resize-vertical"
          disabled={disabled}
        />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {content.length} caracteres
            {saveStatus === 'draft' && content.trim() && (
              <span className="ml-2">• Salvamento automático ativo</span>
            )}
          </div>
          
          <div className="flex space-x-2">
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isManualSaving}
              >
                Cancelar
              </Button>
            )}
            
            <Button 
              onClick={handleManualSave}
              disabled={isManualSaving || !content.trim() || disabled}
              className="flex items-center space-x-2"
            >
              {isManualSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isManualSaving ? 'Salvando...' : 'Salvar'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Salvamento automático ativo:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Seus dados são salvos localmente enquanto você digita</li>
              <li>Sincronização com a nuvem acontece automaticamente a cada 3 segundos</li>
              <li>Em caso de perda de conexão, os dados ficam seguros localmente</li>
              <li>Use "Salvar" para forçar sincronização imediata</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
