
import React from 'react';
import { NewRecordForm } from '../records/NewRecordForm';
import { RecordsList } from '../records/RecordsList';

interface PatientRecordEntriesProps {
  isViewingHistory: boolean;
  activeEntry: any;
  setActiveEntry: (entry: any) => void;
  recordEntries: any[];
  isLoadingRecords: boolean;
  handleSubmit: (data: { content: string }) => void;
  handleViewHistory: (entry: any) => void;
  defaultValue?: string;
  isEditing: boolean;
  isPending: boolean;
  handleDelete: () => void;
}

export const PatientRecordEntries: React.FC<PatientRecordEntriesProps> = ({
  isViewingHistory,
  activeEntry,
  setActiveEntry,
  recordEntries,
  isLoadingRecords,
  handleSubmit,
  handleViewHistory,
  defaultValue,
  isEditing,
  isPending,
  handleDelete,
}) => (
  <div>
    {!isViewingHistory && (
      <NewRecordForm
        onSubmit={handleSubmit}
        onCancel={() => setActiveEntry(null)}
        onDelete={handleDelete}
        isEditing={isEditing}
        defaultValue={defaultValue}
        isPending={isPending}
      />
    )}

    <RecordsList
      records={recordEntries}
      isLoading={isLoadingRecords}
      onEdit={setActiveEntry}
      onViewHistory={handleViewHistory}
    />
  </div>
);
