import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useClinic } from '../../contexts/ClinicContext';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { toast } from '@/components/ui/sonner';
import NoClinicSelected from '../clinic/NoClinicSelected';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireClinic?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, requireClinic = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { activeClinic, isLoadingClinics } = useClinic();
  const navigate = useNavigate();

  // Redirecionamento se não estiver autenticado
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast("Acesso restrito", {
        description: "Faça login para acessar esta página"
      });
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || isLoadingClinics) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Não renderiza nada enquanto redireciona
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar para desktop */}
      <div className="hidden md:block md:w-64">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          {requireClinic && !activeClinic ? (
            <NoClinicSelected />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
