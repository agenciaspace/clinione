
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/1424b683-055d-4b5c-bccc-84cd26273e7a.png" 
            alt="Clini.One Logo" 
            className="h-12 w-auto min-h-[48px] min-w-[150px] max-w-[200px] object-contain sm:h-16 sm:min-h-[64px] sm:min-w-[200px]"
          />
        </div>
        
        <nav className="hidden md:flex items-center space-x-3 lg:space-x-6">
          <a href="#features" className="text-gray-700 hover:text-healthblue-600 font-medium">
            Funcionalidades
          </a>
          <a href="#benefits" className="text-gray-700 hover:text-healthblue-600 font-medium">
            Benefícios
          </a>
          <a href="#pricing" className="text-gray-700 hover:text-healthblue-600 font-medium">
            Planos
          </a>
          <Link to="/login" className="text-healthblue-600 hover:text-healthblue-700 font-medium">
            Entrar
          </Link>
          <Link to="/register">
            <Button>Cadastre-se</Button>
          </Link>
        </nav>
        
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col h-full">
                <div className="flex-1 py-6 flex flex-col gap-4">
                  <a href="#features" className="text-gray-700 hover:text-healthblue-600 font-medium px-2 py-2">
                    Funcionalidades
                  </a>
                  <a href="#benefits" className="text-gray-700 hover:text-healthblue-600 font-medium px-2 py-2">
                    Benefícios
                  </a>
                  <a href="#pricing" className="text-gray-700 hover:text-healthblue-600 font-medium px-2 py-2">
                    Planos
                  </a>
                  <Link to="/login" className="text-healthblue-600 hover:text-healthblue-700 font-medium px-2 py-2">
                    Entrar
                  </Link>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <Link to="/register" className="w-full">
                    <Button className="w-full">Cadastre-se</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
