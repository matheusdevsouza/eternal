'use client';

import { useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = localStorage.getItem('eternal-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return <ThemeProvider>{children}</ThemeProvider>;
}










