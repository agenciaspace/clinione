
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/f27f17f1-fd78-4724-bd56-ab6c1c419fad.png" 
              alt="CliniOne Logo" 
              className="h-10 w-auto logo-glow"
            />
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button>
                Cadastre-se
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Bem-vindo à CliniOne
          </h1>
          <p className="text-gray-700 text-lg mb-8">
            A plataforma completa para a gestão da sua clínica e presença online.
          </p>
          <div className="flex justify-center">
            <Link to="/register">
              <Button size="lg">
                Comece agora
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} CliniOne. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
