
import React from 'react';
import { Clinic } from '@/types';
import EmptyClinicState from './EmptyClinicState';
import ClinicCard from './ClinicCard';

interface ClinicListProps {
  clinics: Clinic[];
  activeClinic: Clinic | null;
  onAddClinic: () => void;
  onSelectClinic: (clinic: Clinic) => void;
  onEditClinic: (clinic: Clinic) => void;
  onDeleteClinic: (id: string) => void;
  onPublishToggle: (clinic: Clinic) => void;
  isPublishing: boolean;
  getPublicUrl: (slug: string) => string;
}

const ClinicList: React.FC<ClinicListProps> = ({
  clinics,
  activeClinic,
  onAddClinic,
  onSelectClinic,
  onEditClinic,
  onDeleteClinic,
  onPublishToggle,
  isPublishing,
  getPublicUrl
}) => {
  if (clinics.length === 0) {
    return <EmptyClinicState onAddClick={onAddClinic} />;
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {clinics.map((clinic) => (
        <ClinicCard
          key={clinic.id}
          clinic={clinic}
          isActive={activeClinic?.id === clinic.id}
          onSelect={onSelectClinic}
          onEdit={onEditClinic}
          onDelete={onDeleteClinic}
          onPublishToggle={onPublishToggle}
          isPublishing={isPublishing}
          getPublicUrl={getPublicUrl}
        />
      ))}
    </div>
  );
};

export default ClinicList;
