import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  serifFont: boolean;
  reducedAnimations: boolean;
  compactMode: boolean;
  sidebarAlwaysVisible: boolean;
  dateFormat: string;
  timeFormat: string;
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  applyTheme: () => void;
}

const defaultSettings: ThemeSettings = {
  theme: 'light',
  language: 'pt-BR',
  fontSize: 'medium',
  serifFont: false,
  reducedAnimations: false,
  compactMode: false,
  sidebarAlwaysVisible: true,
  dateFormat: 'dd/mm/yyyy',
  timeFormat: '24h'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('clinio-theme-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('clinio-theme-settings', JSON.stringify(updated));
      return updated;
    });
  };

  const applyTheme = () => {
    const root = document.documentElement;
    
    // Apply theme
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply font size
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    root.style.fontSize = fontSizeMap[settings.fontSize];

    // Apply serif font
    if (settings.serifFont) {
      root.style.fontFamily = 'Georgia, "Times New Roman", serif';
    } else {
      root.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    }

    // Apply reduced animations
    if (settings.reducedAnimations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply compact mode
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  };

  useEffect(() => {
    applyTheme();
  }, [settings]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 