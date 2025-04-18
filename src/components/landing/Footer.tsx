
import React from 'react';
import { Facebook, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-4">CliniOne</h3>
            <p className="text-gray-400 mb-4">
              Transformando a gestão de clínicas com tecnologia inteligente e focada no paciente.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Produto</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white">Funcionalidades</a></li>
              <li><a href="#benefits" className="text-gray-400 hover:text-white">Benefícios</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white">Planos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Integrações</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Sobre nós</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Clientes</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Trabalhe conosco</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Central de Ajuda</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Documentação</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Status</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Política de Privacidade</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} CliniOne. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Instagram</span>
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Twitter</span>
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
