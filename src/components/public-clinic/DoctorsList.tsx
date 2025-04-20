
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  bio?: string;
  photo_url?: string;
}

interface DoctorsListProps {
  doctors: Doctor[];
}

export const DoctorsList = ({ doctors }: DoctorsListProps) => {
  if (!doctors || doctors.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">Nenhuma informação de profissionais disponível.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {doctors.map((doctor) => {
        const initials = doctor.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div key={doctor.id} className="flex items-center p-4 border rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={doctor.photo_url || undefined} alt={doctor.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="font-medium">{doctor.name}</p>
              <p className="text-sm text-gray-500">{doctor.speciality}</p>
              {doctor.bio && (
                <p className="text-sm text-gray-600 mt-1">{doctor.bio}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
