import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useClinic } from '../../contexts/ClinicContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, ChevronDown } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Mobile toggle */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="flex flex-col h-full">
              <Sidebar onNavItemClick={() => setMobileMenuOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile Logo */}
        <div className="md:hidden flex items-center">
          <img 
            src="/lovable-uploads/1424b683-055d-4b5c-bccc-84cd26273e7a.png" 
            alt="Clini.One Logo" 
            className="h-16 w-auto min-h-[64px] min-w-[200px] max-w-[250px] object-contain aspect-[4/1]"
          />
        </div>

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
          {/* Mobile Clinic Selector */}
          {clinics.length > 0 && (
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-dashed h-8 px-2">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-1 flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:inline text-sm font-medium text-foreground">
                  {user?.name || 'Usuário'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings">Meu perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
