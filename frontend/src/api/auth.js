import api from '../utils/api';

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, brand_name) => api.post('/auth/register', { email, password, brand_name }),
  getMe: () => api.get('/auth/me'),
};
