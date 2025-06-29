
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Calendar, Users, UserCircle, FileBarChart, DollarSign, Settings, Building2, LucideIcon, MessageSquare, Globe } from 'lucide-react';
interface MenuItem {
  title: string;
  path: string;
  icon: LucideIcon;
  roles: string[];
}
interface SidebarProps {
  onNavItemClick?: () => void;
}
export const Sidebar: React.FC<SidebarProps> = ({
  onNavItemClick
}) => {
  const {
    user,
    userRoles
  } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const menuItems: MenuItem[] = [{
    title: 'Agenda',
    path: '/dashboard',
    icon: Calendar,
    roles: ['admin', 'doctor', 'receptionist']
  }, {
    title: 'Pacientes',
    path: '/dashboard/patients',
    icon: Users,
    roles: ['admin', 'doctor', 'receptionist']
  }, {
    title: 'Profissionais',
    path: '/dashboard/doctors',
    icon: UserCircle,
    roles: ['admin']
  }, {
    title: 'Relatórios',
    path: '/dashboard/reports',
    icon: FileBarChart,
    roles: ['admin']
  }, {
    title: 'Financeiro',
    path: '/dashboard/financial',
    icon: DollarSign,
    roles: ['admin']
  }, {
    title: 'Marketing',
    path: '/dashboard/marketing',
    icon: MessageSquare,
    roles: ['admin']
  }, {
    title: 'Clínica',
    path: '/dashboard/clinic',
    icon: Building2,
    roles: ['admin']
  }, {
    title: 'Página Pública',
    path: '/dashboard/public-page',
    icon: Globe,
    roles: ['admin']
  }, {
    title: 'Configurações',
    path: '/dashboard/settings',
    icon: Settings,
    roles: ['admin', 'doctor', 'receptionist']
  }];
  const handleNavClick = () => {
    if (onNavItemClick) {
      onNavItemClick();
    }
  };
  console.log('Current user roles:', userRoles);
  const filteredMenuItems = userRoles.length === 0 ? menuItems : menuItems.filter(item => userRoles.some(role => item.roles.includes(role)));
  return <aside className="flex flex-col bg-white border-r border-gray-200 shadow-sm h-full">
      <div className="px-0 py-0">
        <img src="/lovable-uploads/1424b683-055d-4b5c-bccc-84cd26273e7a.png" alt="Clini.One Logo" className="h-16 w-auto min-h-[150px] min-w-[200px] max-w-[250px] object-contain aspect-[4/1]" />
      </div>

      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredMenuItems.map(item => <li key={item.path}>
              <Link to={item.path} className={cn("flex items-center px-4 py-2.5 text-sm rounded-md transition-colors", "hover:bg-gray-100", path === item.path ? "bg-[#FFFDF5] text-[#0A0A0A] font-medium" : "text-gray-700")} onClick={handleNavClick}>
                <item.icon size={20} className={cn("mr-3", path === item.path ? "text-[#FFD400]" : "text-gray-500")} />
                <span>{item.title}</span>
              </Link>
            </li>)}
        </ul>
      </nav>
    </aside>;
};
