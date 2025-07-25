import { useState, useEffect } from 'react';

const SIDEBAR_STATE_KEY = 'sidebar-collapsed';

export const useSidebar = () => {
  // Initialize from localStorage if available, default to false (expanded)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    try {
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isCollapsed));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [isCollapsed]);

  const toggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const collapse = () => {
    setIsCollapsed(true);
  };

  const expand = () => {
    setIsCollapsed(false);
  };

  return {
    isCollapsed,
    toggle,
    collapse,
    expand,
  };
};