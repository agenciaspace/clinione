
import React from 'react';
import { MapPin } from 'lucide-react';
import { AppointmentScheduler } from './AppointmentScheduler';

interface ClinicHeaderProps {
  name: string;
  logo: string | null;
  photo: string | null;
  address: string | null;
  id: string;
}

export const ClinicHeader = ({ name, logo, photo, address, id }: ClinicHeaderProps) => {
  // Determinar qual imagem usar para o logo
  const logoImage = logo || photo;

  return (
    <header className="relative pb-6 border-b">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            {logoImage ? (
              <img 
                src={logoImage} 
                alt={`${name} - Logo`}
                className="w-16 h-16 object-cover aspect-square"
              /> 
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 rounded-full border-2 border-gray-100">
                <span className="text-blue-600 font-bold text-lg">
                  {name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <p className="text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {address ? address.split(',')[0] : "Endereço não disponível"}
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <AppointmentScheduler clinicId={id} />
        </div>
      </div>
    </header>
  );
};
