import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStudentAuth } from './studentAuthHooks';

export default function StudentProtectedRoute({ children }) {
  const { isAuthenticated, user, loading } = useStudentAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
          <p className="text-sm font-medium text-brand-text-secondary">Verifying student session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'student') {
    // Redirect to the student login page and save the attempted location
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  return children;
}
