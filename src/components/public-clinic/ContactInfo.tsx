import React from 'react';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

interface ContactInfoProps {
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}

export const ContactInfo = ({ address, phone, email, website }: ContactInfoProps) => {
  return (
    <div className="space-y-3">
      {address && (
        <p className="flex items-center text-gray-700 dark:text-gray-300">
          <MapPin className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
          {address}
        </p>
      )}
      
      {phone && (
        <p className="flex items-center text-gray-700 dark:text-gray-300">
          <Phone className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
          {phone}
        </p>
      )}
      
      {email && (
        <p className="flex items-center text-gray-700 dark:text-gray-300">
          <Mail className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
          {email}
        </p>
      )}
      
      {website && (
        <p className="flex items-center text-gray-700 dark:text-gray-300">
          <Globe className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
          {website}
        </p>
      )}
    </div>
  );
};
