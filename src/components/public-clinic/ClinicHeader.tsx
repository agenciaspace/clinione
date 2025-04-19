
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ClinicHeaderProps {
  name: string;
  logo: string | null;
  photo: string | null;
  address: string | null;
}

export const ClinicHeader = ({ name, logo, photo, address }: ClinicHeaderProps) => {
  return (
    <header className="relative pb-6 border-b">
      {logo && (
        <div className="w-full h-48 mb-6 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={logo} 
            alt={`${name} - Banner da clínica`} 
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16">
            <Avatar className="w-full h-full border-2 border-gray-100">
              {photo ? (
                <AvatarImage 
                  src={photo} 
                  alt={`${name} - Foto de perfil`}
                  className="object-cover object-center"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-lg">
                  {name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
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
      </div>
    </header>
  );
};
