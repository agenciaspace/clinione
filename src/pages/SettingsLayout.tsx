import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  User, 
  Lock, 
  Bell, 
  PaintBucket, 
  Mail, 
  Webhook, 
  Archive
} from 'lucide-react';

const SettingsLayout = () => {
  const location = useLocation();
  
  const settingsNavItems = [
    { 
      path: '/dashboard/settings/profile', 
      label: 'Perfil', 
      icon: <User className="h-4 w-4" />,
      description: 'Informações pessoais e foto'
    },
    { 
      path: '/dashboard/settings/security', 
      label: 'Segurança', 
      icon: <Lock className="h-4 w-4" />,
      description: 'Senha e autenticação'
    },
    { 
      path: '/dashboard/settings/notifications', 
      label: 'Notificações', 
      icon: <Bell className="h-4 w-4" />,
      description: 'Preferências de notificação'
    },
    { 
      path: '/dashboard/settings/appearance', 
      label: 'Aparência', 
      icon: <PaintBucket className="h-4 w-4" />,
      description: 'Tema e idioma'
    },
    { 
      path: '/dashboard/settings/email', 
      label: 'Email', 
      icon: <Mail className="h-4 w-4" />,
      description: 'Configurações SMTP'
    },
    { 
      path: '/dashboard/settings/webhooks', 
      label: 'Webhooks', 
      icon: <Webhook className="h-4 w-4" />,
      description: 'Integrações e APIs'
    },
    { 
      path: '/dashboard/settings/archived-data', 
      label: 'Dados Arquivados', 
      icon: <Archive className="h-4 w-4" />,
      description: 'Gerenciar dados arquivados'
    },
  ];

  return (
    <DashboardLayout requireClinic={false}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de navegação */}
        <div className="lg:w-1/4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-500">Gerencie suas preferências e configurações</p>
          </div>
          
          <nav className="space-y-1">
            {settingsNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <div className="mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Conteúdo principal */}
        <div className="lg:w-3/4">
          <Outlet />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsLayout;
