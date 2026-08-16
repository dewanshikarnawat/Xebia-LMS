import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '@/services-lms/authService';
import { useToast } from '@/hooks-lms/useToast';
import { useAuth as useMainAuth } from '../contexts/AuthContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const mainAuth = useMainAuth();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('xebia-lms-token');
    const storedUser = localStorage.getItem('xebia-lms-user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('xebia-lms-user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const { accessToken, refreshToken, user: loggedUser } = response.data;
      
      localStorage.setItem('xebia-lms-token', accessToken);
      localStorage.setItem('xebia-lms-refresh-token', refreshToken);
      localStorage.setItem('xebia-lms-user', JSON.stringify(loggedUser));
      
      setToken(accessToken);
      setUser(loggedUser);
      
      showToast('Successfully logged in', 'success');
      return loggedUser;
    } catch (error) {
      let errorMsg;
      if (error.response) {
        errorMsg = error.response.data?.message
          || (error.response.status === 401 || error.response.status === 403
            ? 'Invalid email or password.'
            : `Server error (${error.response.status}).`);
      } else if (error.request) {
        errorMsg = 'Could not reach the server. Check that the backend is running and reachable.';
      } else {
        errorMsg = 'Login failed. Please check your credentials.';
      }
      showToast(errorMsg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem('xebia-lms-token');
    localStorage.removeItem('xebia-lms-refresh-token');
    localStorage.removeItem('xebia-lms-user');
    
    setToken(null);
    setUser(null);
    
    mainAuth.logout();
    showToast('Logged out successfully', 'info');
  }, [showToast, mainAuth]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  }), [user, token, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

