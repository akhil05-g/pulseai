import api from '../utils/api';

export const ordersAPI = {
  list: (params = {}) => api.get('/orders/', { params }),
  bulkImport: (orders) => api.post('/orders/bulk', { orders }),
  getStats: () => api.get('/orders/stats'),
};
