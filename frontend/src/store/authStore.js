import { create } from 'zustand';
import { authAPI } from '../api/auth';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('pulseai_user') || 'null'),
  token: localStorage.getItem('pulseai_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authAPI.login(email, password);
      const { token, user } = res.data;
      localStorage.setItem('pulseai_token', token);
      localStorage.setItem('pulseai_user', JSON.stringify(user));
      set({ user, token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Login failed', loading: false });
      return false;
    }
  },

  register: async (email, password, brand_name) => {
    set({ loading: true, error: null });
    try {
      const res = await authAPI.register(email, password, brand_name);
      const { token, user } = res.data;
      localStorage.setItem('pulseai_token', token);
      localStorage.setItem('pulseai_user', JSON.stringify(user));
      set({ user, token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Registration failed', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('pulseai_token');
    localStorage.removeItem('pulseai_user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
