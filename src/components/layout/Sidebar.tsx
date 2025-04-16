
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Users, 
  UserCircle, 
  FileBarChart, 
  DollarSign, 
  Settings, 
  Building2, 
  LucideIcon, 
  MessageSquare,
  Globe
} from 'lucide-react';

interface MenuItem {
  title: string;
  path: string;
  icon: LucideIcon;
  roles: string[];
}

interface SidebarProps {
  onNavItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavItemClick }) => {
  const { user, userRoles } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  const menuItems: MenuItem[] = [
    { title: 'Agenda', path: '/dashboard', icon: Calendar, roles: ['admin', 'doctor', 'receptionist'] },
    { title: 'Pacientes', path: '/dashboard/patients', icon: Users, roles: ['admin', 'doctor', 'receptionist'] },
    { title: 'Profissionais', path: '/dashboard/doctors', icon: UserCircle, roles: ['admin'] },
    { title: 'Relatórios', path: '/dashboard/reports', icon: FileBarChart, roles: ['admin'] },
    { title: 'Financeiro', path: '/dashboard/financial', icon: DollarSign, roles: ['admin'] },
    { title: 'Marketing', path: '/dashboard/marketing', icon: MessageSquare, roles: ['admin'] },
    { title: 'Clínica', path: '/dashboard/clinic', icon: Building2, roles: ['admin'] },
    { title: 'Página Pública', path: '/dashboard/public-page', icon: Globe, roles: ['admin'] },
    { title: 'Configurações', path: '/dashboard/settings', icon: Settings, roles: ['admin'] },
  ];

  // Filtra apenas os itens permitidos para os papéis do usuário atual
  const filteredMenuItems = menuItems.filter(
    item => userRoles.some(role => item.roles.includes(role))
  );

  const handleNavClick = () => {
    if (onNavItemClick) {
      onNavItemClick();
    }
  };

  return (
    <aside className="flex flex-col bg-white border-r border-gray-200 shadow-sm h-full">
      <div className="px-6 py-6">
        <h2 className="text-2xl font-bold text-healthblue-600">
          CliniOne
        </h2>
      </div>

      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-2.5 text-sm rounded-md transition-colors",
                  "hover:bg-gray-100",
                  path === item.path 
                    ? "bg-healthblue-50 text-healthblue-600 font-medium" 
                    : "text-gray-700"
                )}
                onClick={handleNavClick}
              >
                <item.icon size={20} className={cn(
                  "mr-3",
                  path === item.path ? "text-healthblue-600" : "text-gray-500"
                )} />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto px-4 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-healthblue-100 flex items-center justify-center text-healthblue-700 font-medium">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'email@exemplo.com'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
