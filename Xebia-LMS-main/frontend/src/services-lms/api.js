import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const isStudentOrTeacherPath = window.location.pathname.startsWith('/student') || window.location.pathname.startsWith('/teacher');
    const token = isStudentOrTeacherPath
      ? localStorage.getItem('xebia-student-token')
      : localStorage.getItem('xebia-lms-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isStudentOrTeacherPath = window.location.pathname.startsWith('/student') || window.location.pathname.startsWith('/teacher');
    
    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = isStudentOrTeacherPath
        ? localStorage.getItem('xebia-student-refresh-token')
        : localStorage.getItem('xebia-lms-refresh-token');
      
      if (refreshToken) {
        try {
          // Attempt to refresh token using axios directly to avoid interceptor loop
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
          const { accessToken } = res.data.data;
          
          if (isStudentOrTeacherPath) {
            localStorage.setItem('xebia-student-token', accessToken);
          } else {
            localStorage.setItem('xebia-lms-token', accessToken);
          }
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed: clear storage and redirect
          if (isStudentOrTeacherPath) {
            localStorage.removeItem('xebia-student-token');
            localStorage.removeItem('xebia-student-refresh-token');
            localStorage.removeItem('xebia-student-user');
            if (window.location.pathname !== '/' && window.location.pathname !== '/student/login' && window.location.pathname !== '/admin/login' && window.location.pathname !== '/teacher/login') {
              window.location.href = window.location.pathname.startsWith('/teacher') ? '/?role=teacher' : '/student/login';
            }
          } else {
            localStorage.removeItem('xebia-lms-token');
            localStorage.removeItem('xebia-lms-refresh-token');
            localStorage.removeItem('xebia-lms-user');
            if (window.location.pathname !== '/' && window.location.pathname !== '/student/login' && window.location.pathname !== '/admin/login') {
              window.location.href = '/?role=admin';
            }
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token: clear storage and redirect
        if (isStudentOrTeacherPath) {
          localStorage.removeItem('xebia-student-token');
          localStorage.removeItem('xebia-student-refresh-token');
          localStorage.removeItem('xebia-student-user');
          if (window.location.pathname !== '/' && window.location.pathname !== '/student/login' && window.location.pathname !== '/admin/login' && window.location.pathname !== '/teacher/login') {
            window.location.href = window.location.pathname.startsWith('/teacher') ? '/?role=teacher' : '/student/login';
          }
        } else {
          localStorage.removeItem('xebia-lms-token');
          localStorage.removeItem('xebia-lms-refresh-token');
          localStorage.removeItem('xebia-lms-user');
          if (window.location.pathname !== '/' && window.location.pathname !== '/student/login' && window.location.pathname !== '/admin/login') {
            window.location.href = '/?role=admin';
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
