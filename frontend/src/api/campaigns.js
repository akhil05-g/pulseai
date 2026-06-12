import api from '../utils/api';

export const campaignsAPI = {
  list: (params = {}) => api.get('/campaigns/', { params }),
  get: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns/', data),
  launch: (id) => api.post(`/campaigns/${id}/launch`),
  pause: (id) => api.post(`/campaigns/${id}/pause`),
  delete: (id) => api.delete(`/campaigns/${id}`),
  getAnalytics: (id) => api.get(`/campaigns/${id}/analytics`),
  getReflection: (id) => api.get(`/campaigns/${id}/reflection`),
  getNextActions: (id) => api.get(`/campaigns/${id}/next-actions`),
};
