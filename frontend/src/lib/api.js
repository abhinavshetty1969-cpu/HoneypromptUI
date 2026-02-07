import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('honeyprompt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('honeyprompt_token');
      localStorage.removeItem('honeyprompt_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Chat
export const chatAPI = {
  send: (data) => api.post('/chat', data),
  detect: (data) => api.post('/detect', data),
};

// Dashboard
export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
};

// Attacks
export const attacksAPI = {
  list: (params) => api.get('/attacks', { params }),
  detail: (id) => api.get(`/attacks/${id}`),
};

// Alerts
export const alertsAPI = {
  list: (params) => api.get('/alerts', { params }),
  markRead: (id) => api.post(`/alerts/${id}/read`),
  markAllRead: () => api.post('/alerts/read-all'),
};

// Users
export const usersAPI = {
  list: () => api.get('/users'),
  block: (data) => api.post('/users/block', data),
  unblock: (id) => api.post(`/users/${id}/unblock`),
};

// Honeypots
export const honeypotsAPI = {
  list: () => api.get('/honeypots'),
  create: (data) => api.post('/honeypots', data),
  update: (id, data) => api.put(`/honeypots/${id}`, data),
  delete: (id) => api.delete(`/honeypots/${id}`),
};

// Profiles
export const profilesAPI = {
  list: () => api.get('/profiles'),
  detail: (userId) => api.get(`/profiles/${userId}`),
};

// Webhooks
export const webhooksAPI = {
  list: () => api.get('/webhooks'),
  create: (data) => api.post('/webhooks', data),
  update: (id, data) => api.put(`/webhooks/${id}`, data),
  delete: (id) => api.delete(`/webhooks/${id}`),
  test: (id) => api.post(`/webhooks/${id}/test`),
};

// API Keys
export const apiKeysAPI = {
  list: () => api.get('/apikeys'),
  create: (data) => api.post('/apikeys', data),
  delete: (id) => api.delete(`/apikeys/${id}`),
  toggle: (id) => api.post(`/apikeys/${id}/toggle`),
};

// Export
export const exportAPI = {
  attacks: (format, params) => api.get(`/attacks/export?format=${format}`, { params, responseType: 'blob' }),
};

export default api;
