import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// Interceptor to add Bearer token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only access localStorage on the browser client
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        // Safe header assignment across Axios v1.x+
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;