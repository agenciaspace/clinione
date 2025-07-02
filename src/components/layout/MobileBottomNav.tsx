import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings as SettingsIcon,
} from "lucide-react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  label: string;
}

export const MobileBottomNav: React.FC = () => {
  const { pathname } = useLocation();

  const items: NavItem[] = [
    { icon: LayoutDashboard, path: "/dashboard", label: "Início" },
    { icon: Calendar, path: "/dashboard/calendar", label: "Agenda" },
    { icon: Users, path: "/dashboard/patients", label: "Pacientes" },
    { icon: SettingsIcon, path: "/dashboard/settings", label: "Config" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card border-t md:hidden">
      <ul className="flex justify-around">
        {items.map(({ icon: Icon, path, label }) => {
          const active = pathname.startsWith(path);
          return (
            <li key={path} className="flex-1">
              <Link
                to={path}
                className="flex flex-col items-center justify-center py-2 gap-1"
              >
                <Icon
                  className={`h-5 w-5 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className="text-xs leading-none">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}; 