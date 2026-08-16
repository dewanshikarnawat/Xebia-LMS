'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { CatalogProvider } from '@/hooks-lms/useCatalog';
import { ToastProvider } from '@/hooks-lms/useToast';
import { AuthProvider } from '@/hooks-lms/useAuth';
import { StudentAuthProvider } from '@/auth-lms/student/StudentAuthProvider';
import { ThemeProvider } from '@/context-lms/ThemeContext';
import { EventsProvider } from '@/features-lms/events/EventsContext';

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <StudentAuthProvider>
              <CatalogProvider>
                <EventsProvider>
                  {children}
                </EventsProvider>
              </CatalogProvider>
            </StudentAuthProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}


