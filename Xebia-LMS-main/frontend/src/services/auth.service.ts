import api from './api';
import type { LoginCredentials, TeacherRegisterData, StudentRegisterData, User } from '../types';

export const authService = {
  teacherLogin: async (data: LoginCredentials) => {
    const res = await api.post('/auth/login', data);
    const authData = res.data.data;
    const user: User = {
      id: authData.email,
      name: authData.fullName,
      email: authData.email,
      role: 'teacher',
    };
    return {
      user,
      token: authData.token,
    };
  },

  teacherRegister: async (data: TeacherRegisterData) => {
    const backendData = {
      fullName: data.name,
      email: data.email,
      password: data.password,
    };
    const res = await api.post('/auth/register/teacher', backendData);
    const authData = res.data.data;
    const user: User = {
      id: authData.email,
      name: authData.fullName,
      email: authData.email,
      role: 'teacher',
    };
    return {
      user,
      token: authData.token,
    };
  },

  login: async (data: LoginCredentials) => {
    const res = await api.post('/auth/login', data);
    const authData = res.data.data;
    const rawRole = authData.role || authData.user?.role;
    let role: 'admin' | 'teacher' | 'student' = 'student';
    if (rawRole) {
      const lower = rawRole.toLowerCase();
      if (lower === 'admin') role = 'admin';
      else if (lower === 'teacher') role = 'teacher';
      else if (lower === 'student') role = 'student';
    }
    const user: User = {
      id: authData.email,
      name: authData.fullName,
      email: authData.email,
      role: role,
      ...(role === 'student' && {
        enrollmentNumber: 'ENR-' + authData.email.split('@')[0].toUpperCase(),
      }),
    } as any;
    return {
      user,
      token: authData.token,
      authData,
    };
  },

  studentLogin: async (data: LoginCredentials) => {
    const res = await api.post('/auth/login', data);
    const authData = res.data.data;
    const user: User = {
      id: authData.email,
      name: authData.fullName,
      email: authData.email,
      role: 'student',
      enrollmentNumber: 'ENR-' + authData.email.split('@')[0].toUpperCase(),
    };
    return {
      user,
      token: authData.token,
    };
  },

  studentRegister: async (data: StudentRegisterData & { batchId: number; phone?: string }) => {
    const backendData = {
      fullName: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || '',
      batchId: Number(data.batchId),
    };
    const res = await api.post('/auth/register/student', backendData);
    const authData = res.data.data;
    const user: User = {
      id: authData.email,
      name: authData.fullName,
      email: authData.email,
      role: 'student',
      enrollmentNumber: data.enrollmentNumber || 'ENR-' + authData.email.split('@')[0].toUpperCase(),
    };
    return {
      user,
      token: authData.token,
    };
  },

  getMe: async () => {
    const userStr = localStorage.getItem('lms_user');
    if (userStr) {
      return { user: JSON.parse(userStr), token: '' };
    }
    throw new Error('Not authenticated');
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};
