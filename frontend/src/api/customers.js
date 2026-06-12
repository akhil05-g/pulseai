import api from '../utils/api';

export const customersAPI = {
  list: (params = {}) => api.get('/customers/', { params }),
  get: (id) => api.get(`/customers/${id}`),
  getProfile: (id) => api.get(`/customers/${id}/profile`),
  bulkImport: (customers) => api.post('/customers/bulk', { customers }),
  getJourney: (id) => api.get(`/customers/${id}/journey`),
};
