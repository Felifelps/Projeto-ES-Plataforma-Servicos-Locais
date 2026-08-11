import axios from 'axios';

const TOKEN_KEY = 'auth_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401;
    // Evita redirecionar se o erro 401 ocorrer na própria tentativa de login
    const isLoginRoute = window.location.pathname === '/login';

    if (isUnauthorized && !isLoginRoute) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default api;
