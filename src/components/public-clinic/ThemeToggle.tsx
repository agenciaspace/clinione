import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeTogglePublic: React.FC = () => {
  const { settings, updateSettings } = useTheme();

  const handleChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  const selected = settings.theme;

  const baseBtn =
    'p-1 rounded-full transition-colors hover:bg-white/50 dark:hover:bg-zinc-600';
  const activeLight =
    'bg-white text-yellow-500 dark:bg-zinc-500 dark:text-yellow-400';
  const activeSystem =
    'bg-white text-blue-600 dark:bg-zinc-500 dark:text-blue-400';
  const activeDark =
    'bg-white text-purple-600 dark:bg-zinc-500 dark:text-purple-400';

  return (
    <div className="inline-flex items-center space-x-1 rounded-full bg-zinc-300/60 dark:bg-zinc-700/60 p-1 backdrop-blur-sm shadow-sm">
      <button
        aria-label="Tema claro"
        onClick={() => handleChange('light')}
        className={`${baseBtn} ${selected === 'light' ? activeLight : ''}`}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        aria-label="Tema do sistema"
        onClick={() => handleChange('system')}
        className={`${baseBtn} ${selected === 'system' ? activeSystem : ''}`}
      >
        <Laptop className="h-4 w-4" />
      </button>
      <button
        aria-label="Tema escuro"
        onClick={() => handleChange('dark')}
        className={`${baseBtn} ${selected === 'dark' ? activeDark : ''}`}
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}; 