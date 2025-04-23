
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-[#FFFDF5] to-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse md:flex-row items-center">
          <div className="md:w-1/2 md:pr-6 lg:pr-12 mt-8 md:mt-0">
            <Badge className="mb-4 bg-[#FFD400] text-[#0A0A0A]">Nova Plataforma</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-[#0A0A0A]">
              Gestão completa para sua clínica e presença online
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
              Centraliza o gerenciamento da sua clínica e ofereça experiências excepcionais para seus pacientes com nossa plataforma tudo-em-um.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full">
                  Começar agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  Conheça os recursos
                </Button>
              </a>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-[#FFFDF5] rounded-full filter blur-3xl opacity-30"></div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#FFFDF5] rounded-full filter blur-3xl opacity-30"></div>
              <img 
                src="/lovable-uploads/23a94562-2cda-47ac-ad04-8d2c65539b49.png" 
                alt="Médico e paciente consultando documentos" 
                className="relative z-10 rounded-lg shadow-xl w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
