import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  // Em produção o Express servirá na mesma porta, então /api funciona sem baseURL fixa
  baseURL: '/api',
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
