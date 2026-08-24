import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ts_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — clear auth and redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ts_token');
      localStorage.removeItem('ts_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
