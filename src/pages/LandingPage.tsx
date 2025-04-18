import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div>
      <header>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/1424b683-055d-4b5c-bccc-84cd26273e7a.png" 
              alt="Clini.One Logo" 
              className="h-16 w-auto"
            />
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><Link to="/login" className="hover:text-gray-500">Login</Link></li>
              <li><Link to="/register" className="hover:text-gray-500">Register</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Clini.One</h1>
          <p className="text-lg text-gray-700 mb-8">
            A solução completa para a gestão da sua clínica.
          </p>
          <Link to="/register" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Comece agora
          </Link>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
