
import React from 'react';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  bio?: string;
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
      {doctors.map((doctor) => (
        <div key={doctor.id} className="flex items-center p-4 border rounded-lg">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
            {doctor.name.charAt(0) + (doctor.name.split(' ')[1]?.charAt(0) || '')}
          </div>
          <div className="ml-3">
            <p className="font-medium">{doctor.name}</p>
            <p className="text-sm text-gray-500">{doctor.speciality}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
