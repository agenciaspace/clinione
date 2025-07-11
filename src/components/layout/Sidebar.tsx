import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Calendar, Users, UserCircle, FileBarChart, DollarSign, Settings, Building2, LucideIcon, MessageSquare, Globe, LayoutDashboard } from 'lucide-react';

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

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'owner', 'admin', 'doctor', 'staff', 'receptionist']
    },
    {
      title: 'Calendário',
      path: '/dashboard/calendar',
      icon: Calendar,
      roles: ['super_admin', 'owner', 'admin', 'doctor', 'staff', 'receptionist']
    },
    {
      title: 'Pacientes',
      path: '/dashboard/patients',
      icon: Users,
      roles: ['super_admin', 'owner', 'admin', 'doctor', 'staff', 'receptionist']
    },
    {
      title: 'Profissionais',
      path: '/dashboard/doctors',
      icon: UserCircle,
      roles: ['super_admin', 'owner', 'admin']
    },
    {
      title: 'Relatórios',
      path: '/dashboard/reports',
      icon: FileBarChart,
      roles: ['super_admin', 'owner', 'admin']
    },
    {
      title: 'Financeiro',
      path: '/dashboard/financial',
      icon: DollarSign,
      roles: ['super_admin', 'owner', 'admin']
    },
    {
      title: 'Clínica',
      path: '/dashboard/clinic',
      icon: Building2,
      roles: ['super_admin', 'owner', 'admin']
    },
    {
      title: 'Página Pública',
      path: '/dashboard/public-page',
      icon: Globe,
      roles: ['super_admin', 'owner', 'admin']
    },
    {
      title: 'Configurações',
      path: '/dashboard/settings',
      icon: Settings,
      roles: ['super_admin', 'owner', 'admin', 'doctor', 'staff', 'receptionist']
    }
  ];

  const handleNavClick = () => {
    if (onNavItemClick) {
      onNavItemClick();
    }
  };

  console.log('Current user roles:', userRoles);
  console.log('Menu items before filter:', menuItems.length);
  
  // Fix: Ensure owner role has access to all items (emergency fix)
  const filteredMenuItems = userRoles.length === 0 ? menuItems : menuItems.filter(item => {
    const hasAccess = userRoles.some(role => item.roles.includes(role));
    console.log(`Menu "${item.title}": roles ${JSON.stringify(item.roles)}, user roles ${JSON.stringify(userRoles)}, access: ${hasAccess}`);
    return hasAccess;
  });
  
  // Emergency fallback: if no items but user has 'owner' role, show all items
  const finalMenuItems = filteredMenuItems.length === 0 && userRoles.includes('owner') ? menuItems : filteredMenuItems;
  
  console.log('Filtered menu items:', filteredMenuItems.length);
  console.log('Final menu items (with fallback):', finalMenuItems.length);

  return (
    <aside className="flex flex-col bg-card border-r border-border shadow-sm h-full">
      <div className="px-0 py-0">
        <img 
          src="/lovable-uploads/1424b683-055d-4b5c-bccc-84cd26273e7a.png" 
          alt="Clini.One Logo" 
          className="h-16 w-auto min-h-[150px] min-w-[200px] max-w-[250px] object-contain aspect-[4/1]" 
        />
      </div>

      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        <ul className="space-y-1">
          {finalMenuItems.map(item => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={cn(
                  "flex items-center px-4 py-2.5 text-sm rounded-md transition-colors",
                  "hover:bg-accent",
                  path === item.path ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                )} 
                onClick={handleNavClick}
              >
                <item.icon 
                  size={20} 
                  className={cn(
                    "mr-3", 
                    path === item.path ? "text-primary" : "text-muted-foreground"
                  )} 
                />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
