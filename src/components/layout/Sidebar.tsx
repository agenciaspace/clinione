import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Calendar, Users, UserCircle, FileBarChart, DollarSign, Settings, Building2, LucideIcon, MessageSquare, Globe, LayoutDashboard, FileText } from 'lucide-react';

interface MenuItem {
  title: string;
  path: string;
  icon: LucideIcon;
  roles: string[];
}

interface SidebarProps {
  onNavItemClick?: () => void;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNavItemClick,
  isCollapsed = false
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
      title: 'Prontuário',
      path: '/dashboard/medical-records',
      icon: FileText,
      roles: ['super_admin', 'owner', 'admin', 'doctor', 'staff']
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
    <aside className={cn(
      "flex flex-col bg-card border-r border-border shadow-sm h-full transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "overflow-hidden flex items-center justify-center",
        isCollapsed ? "py-4" : "px-0 py-0"
      )}>
        {isCollapsed ? (
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-xl">C</span>
          </div>
        ) : (
          <img 
            src="/lovable-uploads/1424b683-055d-4b5c-bccc-84cd26273e7a.png" 
            alt="Clini.One Logo" 
            className="h-16 w-auto min-h-[150px] min-w-[200px] max-w-[250px] object-contain aspect-[4/1]" 
          />
        )}
      </div>

      {/* Divider */}
      <div className={cn(
        "border-t border-border mx-2",
        isCollapsed ? "my-2" : "my-4"
      )} />

      <nav className={cn(
        "flex-1 overflow-y-auto",
        isCollapsed ? "px-1 pt-1 pb-4" : "px-4 pt-2 pb-4"
      )}>
        <ul className={cn(
          isCollapsed ? "space-y-3" : "space-y-1"
        )}>
          {finalMenuItems.map(item => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={cn(
                  "flex items-center text-sm rounded-lg transition-all duration-200 relative group",
                  "hover:bg-accent hover:shadow-sm",
                  isCollapsed 
                    ? "w-14 h-12 justify-center mx-auto" 
                    : "px-4 py-3",
                  path === item.path 
                    ? "bg-accent text-accent-foreground font-medium shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )} 
                onClick={handleNavClick}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon 
                  size={isCollapsed ? 22 : 20} 
                  className={cn(
                    "transition-colors",
                    isCollapsed ? "mr-0" : "mr-3", 
                    path === item.path ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                {!isCollapsed && (
                  <span className="truncate">{item.title}</span>
                )}
                
                {/* Enhanced tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg border shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap">
                    <div className="flex items-center">
                      <item.icon size={16} className="mr-2 text-primary" />
                      {item.title}
                    </div>
                    {/* Arrow pointing to the button */}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-popover border-l border-t border-border rotate-45"></div>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
