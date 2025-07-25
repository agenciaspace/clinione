
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientInfo } from '../records/PatientInfo';
import { RecordHistory } from '../records/RecordHistory';
import { RecordsList } from '../records/RecordsList';
import { NewRecordForm } from '../records/NewRecordForm';

interface PatientRecordTabsProps {
  patient: any;
  activeEntry: any;
  setActiveEntry: (entry: any) => void;
  isViewingHistory: boolean;
  setIsViewingHistory: (b: boolean) => void;
  recordEntries: any[];
  isLoadingRecords: boolean;
  auditLogs: any[];
  isLoadingAuditLog: boolean;
  onSubmit: (d: { content: string }) => void;
  onDelete: () => void;
  isEditing: boolean;
  defaultValue?: string;
  isPending: boolean;
}

export const PatientRecordTabs: React.FC<PatientRecordTabsProps> = ({
  patient, activeEntry, setActiveEntry, isViewingHistory, setIsViewingHistory,
  recordEntries, isLoadingRecords, auditLogs, isLoadingAuditLog,
  onSubmit, onDelete, isEditing, defaultValue, isPending
}) => (
  <Tabs defaultValue="record" className="w-full">
    <TabsList className="mb-4">
      <TabsTrigger value="record">Prontuário</TabsTrigger>
      <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
    </TabsList>
    <TabsContent value="record">
      <div className="space-y-6">
        {!isViewingHistory && (
          <NewRecordForm
            patient={patient}
            onSubmit={onSubmit}
            onCancel={() => setActiveEntry(null)}
            onDelete={onDelete}
            isEditing={isEditing}
            defaultValue={defaultValue}
            isPending={isPending}
            recordId={activeEntry?.id}
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
          onEdit={setActiveEntry}
          onViewHistory={(entry: any) => {
            setActiveEntry(entry);
            setIsViewingHistory(true);
          }}
        />
      </div>
    </TabsContent>
    <TabsContent value="info">
      <PatientInfo patient={patient} />
    </TabsContent>
  </Tabs>
);

