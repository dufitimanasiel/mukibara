import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/injira')) {
        window.location.href = '/injira';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const announcementAPI = {
  getPublic: (params) => api.get('/announcements/public', { params }),
  getAll: (params) => api.get('/announcements', { params }),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/announcements/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  updateStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
};

export const pinAPI = {
  getAll: () => api.get('/pins'),
  create: (pin_code) => api.post('/pins', { pin_code }),
  updateStatus: (id, status) => api.put(`/pins/${id}/status`, { status }),
  verify: (pin_code) => api.post('/pins/verify', { pin_code }),
};

export const statsAPI = {
  getAll: () => api.get('/stats'),
};

export const getUploadUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

export default api;
