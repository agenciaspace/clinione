
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-[#FFD400] to-[#FFE133] text-[#0A0A0A]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
          Pronto para transformar sua clínica?
        </h2>
        <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
          Junte-se a milhares de profissionais que já estão usando nossa plataforma para melhorar a gestão e crescer.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-[#0A0A0A] text-white hover:bg-gray-800">
              Experimente Grátis
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-[#0A0A0A] border-[#0A0A0A] hover:bg-black/10 w-full sm:w-auto"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Fale com um Consultor
          </Button>
        </div>
      </div>
    </section>
  );
};
