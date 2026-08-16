import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { User, AuthState } from '../types';
import { authService } from '../services/auth.service';

// ─── Actions ──────────────────────────────────────────────────────────────────
type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

// ─── Reducer ──────────────────────────────────────────────────────────────────
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface AuthContextType extends AuthState {
  login: (user: User, token?: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const userStr = localStorage.getItem('lms_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: 'LOGIN', payload: { user, token: '' } });
      } catch {
        localStorage.removeItem('lms_user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = (user: User, token?: string) => {
    localStorage.setItem('lms_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { user, token: token || '' } });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('lms_user');
    localStorage.removeItem('xebia-student-token');
    localStorage.removeItem('xebia-student-refresh-token');
    localStorage.removeItem('xebia-student-user');
    localStorage.removeItem('xebia-lms-token');
    localStorage.removeItem('xebia-lms-refresh-token');
    localStorage.removeItem('xebia-lms-user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('lms_user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
