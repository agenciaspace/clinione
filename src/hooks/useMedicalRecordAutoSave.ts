import { useState, useEffect } from 'react';
import { useAutoSave } from './useAutoSave';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface MedicalRecordDraft {
  id?: string;
  content: string;
  title?: string;
  patientId: string;
  appointmentId?: string;
  lastModified: number;
  type: 'patient_record' | 'appointment_note';
}

interface UseMedicalRecordAutoSaveOptions {
  patientId: string;
  appointmentId?: string;
  initialContent?: string;
  recordId?: string; // For editing existing records
}

export const useMedicalRecordAutoSave = ({
  patientId,
  appointmentId,
  initialContent = '',
  recordId
}: UseMedicalRecordAutoSaveOptions) => {
  const [content, setContent] = useState(initialContent);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'draft'>('saved');

  // Create unique key for this record/appointment
  const storageKey = recordId 
    ? `medical_record_${recordId}`
    : appointmentId 
      ? `appointment_note_${appointmentId}`
      : `patient_record_${patientId}_new`;

  // Cloud save function
  const saveToCloud = async (draft: MedicalRecordDraft) => {
    setSaveStatus('saving');
    
    try {
      // Get current user and clinic info
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('User not authenticated');

      // Get current clinic ID (you might need to pass this as a prop)
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('clinic_id')
        .eq('user_id', session.user.id)
        .limit(1)
        .single();

      if (userRolesError || !userRoles?.clinic_id) {
        throw new Error('User is not associated with any clinic');
      }

      // Save draft to drafts table for backup
      const { error: draftError } = await (supabase as any)
        .from('drafts' as any)
        .upsert(
          {
          user_id: session.user.id,
          clinic_id: userRoles.clinic_id,
          draft_key: storageKey,
          content: draft.content,
          draft_type: draft.type,
          related_id: draft.type === 'appointment_note' ? appointmentId : patientId,
          metadata: {
            title: draft.title,
            patient_id: patientId,
            appointment_id: appointmentId
          }
        },
        { onConflict: 'user_id,draft_key' }
      );

      if (draftError) {
        console.warn('Failed to save draft backup:', draftError);
        // Don't throw error here, as local save is more important
      }

      // Save to actual table only if content is substantial (more than just whitespace)
      if (draft.content.trim().length > 10) {
        if (draft.type === 'appointment_note' && appointmentId) {
          // Save as appointment note
          const { error } = await supabase
            .from('appointments')
            .update({ 
              notes: draft.content,
              updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId);
            
          if (error) throw error;
        } else if (draft.type === 'patient_record' && patientId !== 'temp') {
          // Save as patient record (only for real patients, not temp ones)
          const isTempId = recordId?.startsWith('new_record_');
          if (recordId && !isTempId) {
            // Update existing record
            const { error } = await supabase
              .from('patient_records')
              .update({
                content: draft.content,
                updated_at: new Date().toISOString()
              })
              .eq('id', recordId);
              
            if (error) throw error;
          } else {
            // Create new record
            const { error } = await supabase
              .from('patient_records')
              .insert({
                patient_id: patientId,
                title: draft.title || 'Prontuário',
                content: draft.content,
                clinic_id: userRoles.clinic_id,
                created_by: session.user.id
              });
              
            if (error) throw error;
          }
        }
      }
      
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      setSaveStatus('error');
      throw error;
    }
  };

  // Setup auto-save
  const { loadFromLocalStorage, clearLocalStorage } = useAutoSave({
    key: storageKey,
    data: {
      id: recordId,
      content,
      title: 'Prontuário',
      patientId,
      appointmentId,
      lastModified: Date.now(),
      type: appointmentId ? 'appointment_note' : 'patient_record'
    } as MedicalRecordDraft,
    saveToCloud,
    autoSaveDelay: 3000, // 3 seconds
    onSaveSuccess: () => {
      setSaveStatus('saved');
      setLastSaved(new Date());
      toast.success('Prontuário salvo automaticamente', {
        duration: 2000,
      });
    },
    onSaveError: (error) => {
      setSaveStatus('error');
      toast.error('Erro ao salvar prontuário automaticamente', {
        description: 'Os dados foram salvos localmente e serão sincronizados quando possível.',
        duration: 4000,
      });
    }
  });

  // Load draft on component mount
  useEffect(() => {
    if (!isDraftLoaded) {
      const savedDraft = loadFromLocalStorage();
      if (savedDraft && savedDraft.content && savedDraft.content !== initialContent) {
        setContent(savedDraft.content);
        setSaveStatus('draft');
        toast.info('Rascunho carregado do armazenamento local', {
          duration: 3000,
        });
      }
      setIsDraftLoaded(true);
    }
  }, [loadFromLocalStorage, initialContent, isDraftLoaded]);

  // Manual save function
  const manualSave = async () => {
    try {
      const draft: MedicalRecordDraft = {
        id: recordId,
        content,
        title: 'Prontuário',
        patientId,
        appointmentId,
        lastModified: Date.now(),
        type: appointmentId ? 'appointment_note' : 'patient_record'
      };
      
      await saveToCloud(draft);
      clearLocalStorage(); // Clear draft after successful save
    } catch (error) {
      console.error('Manual save error:', error);
      throw error;
    }
  };

  // Clear draft
  const clearDraft = () => {
    clearLocalStorage();
    setSaveStatus('saved');
  };

  // Update content
  const updateContent = (newContent: string) => {
    setContent(newContent);
    if (newContent !== initialContent) {
      setSaveStatus('draft');
    }
  };

  return {
    content,
    updateContent,
    manualSave,
    clearDraft,
    saveStatus,
    lastSaved,
    isDraftLoaded
  };
};
