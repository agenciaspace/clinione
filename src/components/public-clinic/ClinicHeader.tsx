
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin } from 'lucide-react';

interface ClinicHeaderProps {
  name: string;
  logo: string | null;
  address: string | null;
}

export const ClinicHeader = ({ name, logo, address }: ClinicHeaderProps) => {
  return (
    <header className="flex flex-col md:flex-row md:justify-between md:items-center pb-6 border-b">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
          {logo ? (
            <img src={logo} alt={name} className="w-full h-full object-cover rounded-full" />
          ) : (
            name.charAt(0)
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
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Agendar Consulta
        </Button>
      </div>
    </header>
  );
};
