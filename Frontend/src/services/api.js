import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5187/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per aggiungere il token JWT alle richieste
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (nome, email, password) =>
    api.post('/auth/register', { nome, email, password }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// Bookings API
export const bookingsAPI = {
  getAll: () => api.get('/bookings'),

  getById: (id) => api.get(`/bookings/${id}`),

  getMy: () => api.get('/bookings/my'),

  create: (dataInizio, dataFine, note) =>
    api.post('/bookings', { dataInizio, dataFine, note }),

  update: (id, dataInizio, dataFine, note) =>
    api.put(`/bookings/${id}`, { dataInizio, dataFine, note }),

  delete: (id) => api.delete(`/bookings/${id}`),

  checkAvailability: (dataInizio, dataFine) =>
    api.get('/bookings/check-availability', {
      params: { dataInizio, dataFine },
    }),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),

  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  changeUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),

  deleteAnyBooking: (id) => api.delete(`/admin/bookings/${id}`),

  getStats: () => api.get('/admin/stats'),
};

export default api;
