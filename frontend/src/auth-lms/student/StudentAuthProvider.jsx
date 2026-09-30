import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { studentAuthService } from './studentAuthService';
import { useToast } from '@/hooks-lms/useToast';
import { useAuth as useMainAuth } from '../../contexts/AuthContext';

export const StudentAuthContext = createContext(null);

export function StudentAuthProvider({ children }) {
  const mainAuth = useMainAuth();
  const [studentUser, setStudentUser] = useState(null);
  const [studentToken, setStudentToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('xebia-student-token');
    const storedUser = localStorage.getItem('xebia-student-user');
    
    if (storedToken && storedUser) {
      setStudentToken(storedToken);
      try {
        setStudentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('xebia-student-user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await studentAuthService.login(email, password);
      const { accessToken, refreshToken, user } = data;
      
      localStorage.setItem('xebia-student-token', accessToken);
      localStorage.setItem('xebia-student-refresh-token', refreshToken);
      localStorage.setItem('xebia-student-user', JSON.stringify(user));
      
      setStudentToken(accessToken);
      setStudentUser(user);
      
      showToast('Successfully logged in!', 'success');
      return user;
    } catch (error) {
      showToast(error.message || 'Invalid Email or Password.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const register = useCallback(async (fullName, email, password) => {
    setLoading(true);
    try {
      const result = await studentAuthService.register(fullName, email, password);
      showToast('Account created successfully. Please sign in.', 'success');
      return result;
    } catch (error) {
      showToast(error.message || 'Registration failed.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem('xebia-student-token');
    localStorage.removeItem('xebia-student-refresh-token');
    localStorage.removeItem('xebia-student-user');
    
    setStudentToken(null);
    setStudentUser(null);
    
    mainAuth.logout();
    showToast('Logged out successfully', 'info');
  }, [showToast, mainAuth]);

  const value = useMemo(() => ({
    user: studentUser,
    token: studentToken,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!studentToken,
  }), [studentUser, studentToken, loading, login, register, logout]);

  return (
    <StudentAuthContext.Provider value={value}>
      {children}
    </StudentAuthContext.Provider>
  );
}

