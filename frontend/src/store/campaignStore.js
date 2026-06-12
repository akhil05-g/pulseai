import { create } from 'zustand';
import { campaignsAPI } from '../api/campaigns';

const useCampaignStore = create((set, get) => ({
  campaigns: [],
  currentCampaign: null,
  loading: false,
  error: null,

  fetchCampaigns: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await campaignsAPI.list(params);
      set({ campaigns: res.data.campaigns || res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchCampaign: async (id) => {
    set({ loading: true });
    try {
      const res = await campaignsAPI.get(id);
      set({ currentCampaign: res.data.campaign || res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createCampaign: async (data) => {
    set({ loading: true });
    try {
      const res = await campaignsAPI.create(data);
      const campaign = res.data.campaign || res.data;
      set((state) => ({ 
        campaigns: [campaign, ...state.campaigns], 
        currentCampaign: campaign,
        loading: false 
      }));
      return campaign;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  launchCampaign: async (id) => {
    try {
      const res = await campaignsAPI.launch(id);
      set((state) => ({
        campaigns: state.campaigns.map(c => 
          c.id === id ? { ...c, status: 'running' } : c
        ),
      }));
      return res.data;
    } catch (err) {
      set({ error: err.message });
      return null;
    }
  },

  deleteCampaign: async (id) => {
    try {
      await campaignsAPI.delete(id);
      set((state) => ({
        campaigns: state.campaigns.filter(c => c.id !== id),
      }));
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },
}));

export default useCampaignStore;
