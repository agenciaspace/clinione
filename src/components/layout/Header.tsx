
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useClinic } from '../../contexts/ClinicContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { clinics, activeClinic, setActiveClinic, isLoadingClinics } = useClinic();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Mobile toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Alternar navegação</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex flex-col h-full">
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>

        {/* Clinic Selector */}
        {clinics.length > 0 && (
          <div className="hidden sm:flex items-center ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-dashed">
                  {isLoadingClinics ? (
                    <span className="animate-pulse">Carregando clínicas...</span>
                  ) : activeClinic ? (
                    <>
                      <span className="mr-1">{activeClinic.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  ) : (
                    'Selecionar clínica'
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {clinics.map((clinic) => (
                  <DropdownMenuItem 
                    key={clinic.id} 
                    onClick={() => setActiveClinic(clinic)}
                    className={activeClinic?.id === clinic.id ? 'bg-muted' : ''}
                  >
                    {clinic.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/clinic" className="cursor-pointer w-full">
                    Gerenciar clínicas
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          
          <div className="relative">
            <button
              className="flex items-center space-x-2"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-8 h-8 rounded-full bg-healthblue-100 flex items-center justify-center text-healthblue-700 font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {user?.name || 'Usuário'}
              </span>
            </button>
            
            {showDropdown && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-10"
                onMouseLeave={() => setShowDropdown(false)}
              >
                <Link 
                  to="/dashboard/settings" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Meu perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
