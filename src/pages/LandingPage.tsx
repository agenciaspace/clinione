
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/1424b683-055d-4b5c-bccc-84cd26273e7a.png" 
              alt="Clini.One Logo" 
              className="h-16 w-auto"
            />
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><Link to="/login" className="text-lg hover:text-gray-500">Login</Link></li>
              <li><Link to="/register" className="text-lg hover:text-gray-500">Register</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl font-bold mb-4">Bem-vindo ao Clini.One</h1>
        <p className="text-xl text-gray-700 mb-8">
          A solução completa para a gestão da sua clínica.
        </p>
        <Link 
          to="/register" 
          className="bg-[#4285F4] hover:bg-[#3367D6] text-white font-medium py-3 px-8 rounded-md text-lg"
        >
          Comece agora
        </Link>
      </main>
    </div>
  );
};

export default LandingPage;
