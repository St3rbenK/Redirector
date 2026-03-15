import axios from 'axios';

const api = axios.create({
  // In production, Nginx will proxy /api to the backend
  // Locally, Vite's dev proxy will handle it
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
