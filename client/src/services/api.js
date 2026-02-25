import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  join: (data) => api.post('/auth/join', data),
  login: (data) => api.post('/auth/login', data),
};

// ─── Household ───
export const householdApi = {
  get: () => api.get('/household'),
  update: (data) => api.put('/household', data),
};

// ─── Users ───
export const usersApi = {
  list: () => api.get('/users'),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
};

// ─── Lessons ───
export const lessonsApi = {
  list: () => api.get('/lessons'),
  create: (data) => api.post('/lessons', data),
  update: (id, data) => api.put(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
  complete: (id) => api.post(`/lessons/${id}/complete`),
};

// ─── Completed Lessons ───
export const completedLessonsApi = {
  list: (params) => api.get('/completed-lessons', { params }),
  approve: (id) => api.put(`/completed-lessons/${id}/approve`),
  reject: (id) => api.put(`/completed-lessons/${id}/reject`),
};

// ─── Leaderboard ───
export const leaderboardApi = {
  get: () => api.get('/leaderboard'),
};

export default api;
