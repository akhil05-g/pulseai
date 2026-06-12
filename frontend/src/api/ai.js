import api from '../utils/api';

export const aiAPI = {
  command: (message, history = []) => api.post('/ai/command', { message, history }),
};
