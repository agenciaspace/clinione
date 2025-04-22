
import React from 'react';
import { RecordHistory } from '../records/RecordHistory';

interface PatientRecordAuditHistoryProps {
  auditLogs: any[];
  isLoading: boolean;
  onClose: () => void;
}

export const PatientRecordAuditHistory: React.FC<PatientRecordAuditHistoryProps> = ({
  auditLogs, isLoading, onClose,
}) => (
  <RecordHistory
    auditLogs={auditLogs}
    isLoading={isLoading}
    onClose={onClose}
  />
);
