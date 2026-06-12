import api from '../utils/api';

export const segmentsAPI = {
  list: () => api.get('/segments/'),
  get: (id) => api.get(`/segments/${id}`),
  create: (data) => api.post('/segments/', data),
  aiDiscover: (query) => api.post('/segments/ai-discover', { query }),
  preview: (id) => api.get(`/segments/${id}/preview`),
  delete: (id) => api.delete(`/segments/${id}`),
};
