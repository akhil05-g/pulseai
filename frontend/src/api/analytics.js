import api from '../utils/api';

export const analyticsAPI = {
  getDashboardStats: () => api.get('/dashboard/stats'),
  getDashboardOpportunities: () => api.get('/dashboard/opportunities'),
  getOverview: () => api.get('/analytics/overview'),
  getChannelComparison: () => api.get('/analytics/channel-comparison'),
  getRevenueTrend: () => api.get('/analytics/revenue-trend'),
  getCampaignTrends: () => api.get('/analytics/campaign-trends'),
};
