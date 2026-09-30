'use client';

import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useCatalog } from '@/hooks-lms/useCatalog';

export default function AppLayout({ children }) {
  const { branding, hydrated } = useCatalog();

  useEffect(() => {
    if (hydrated) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor || '#6C1D5F');
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor || '#84117C');
    }
  }, [branding, hydrated]);

  return (
    <div className="min-h-screen bg-brand-surface text-brand-text-primary transition-colors duration-200">
      <Sidebar />
      <div style={{ paddingLeft: 220 }}>
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

