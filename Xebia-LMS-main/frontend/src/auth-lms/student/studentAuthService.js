import api from '@/services-lms/api';

export const studentAuthService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // Returns backend payload: { accessToken, refreshToken, user: { email, fullName, role, avatar } }
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid Email or Password.';
      throw new Error(msg);
    }
  },

  register: async (fullName, email, password) => {
    try {
      const response = await api.post('/auth/register/student', { fullName, email, password });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      throw new Error(msg);
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Password recovery request failed.';
      throw new Error(msg);
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed.';
      throw new Error(msg);
    }
  }
};
