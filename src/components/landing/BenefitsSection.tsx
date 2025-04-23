
import React from 'react';
import { Clock, LineChart, Users, Globe } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Economize Tempo',
    description: 'Automatize processos administrativos e foque no que realmente importa: o atendimento ao paciente.'
  },
  {
    icon: LineChart,
    title: 'Aumente Receitas',
    description: 'Reduza faltas, otimize sua agenda e aumente a satisfação e fidelização dos pacientes.'
  },
  {
    icon: Users,
    title: 'Melhore a Experiência',
    description: 'Ofereça um atendimento mais eficiente e personalizado para cada paciente.'
  },
  {
    icon: Globe,
    title: 'Fortaleça sua Marca',
    description: 'Crie uma presença online profissional e aumente a visibilidade da sua clínica.'
  }
];

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Benefícios para sua clínica
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Potencialize seus resultados e ofereça uma experiência superior para seus pacientes
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 text-center">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <div className="inline-block p-3 bg-[#FFFDF5] rounded-full mb-4">
                <benefit.icon className="h-7 w-7 text-[#FFD400]" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
