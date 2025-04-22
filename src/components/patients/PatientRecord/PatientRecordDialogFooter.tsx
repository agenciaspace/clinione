
import React from 'react';
import { Button } from '@/components/ui/button';

export const PatientRecordDialogFooter = ({ onClose }: { onClose: () => void }) => (
  <div className="flex justify-end mt-8">
    <Button variant="outline" onClick={onClose}>
      Fechar
    </Button>
  </div>
);
