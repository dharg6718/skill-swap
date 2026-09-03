import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const isLocalApiUrl = configuredApiUrl?.includes('localhost') || configuredApiUrl?.includes('127.0.0.1');
const apiBaseUrl = import.meta.env.PROD && isLocalApiUrl
  ? '/api'
  : configuredApiUrl || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    const isGetMe = error.config?.url?.includes('/auth/me');
    if ((error.response?.status === 401 || (error.response?.status === 404 && isGetMe)) && !isAuthRoute) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
