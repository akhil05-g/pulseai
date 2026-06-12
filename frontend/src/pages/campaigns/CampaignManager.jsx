import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pause, Eye, Trash2, AlertTriangle, X } from 'lucide-react';
import { campaignsAPI } from '../../api/campaigns';
import useCampaignStore from '../../store/campaignStore';
import { formatCurrency, formatDate, formatPercent, getStatusColor, getChannelIcon } from '../../utils/format';

const tabs = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Running', value: 'running' },
  { label: 'Completed', value: 'completed' },
];

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { deleteCampaign } = useCampaignStore();

  const fetchCampaigns = () => {
    setLoading(true);
    campaignsAPI.list({ status: statusFilter || undefined })
      .then(r => setCampaigns(r.data.campaigns || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCampaigns(); }, [statusFilter]);

  const handlePause = async (e, id) => {
    e.stopPropagation();
    await campaignsAPI.pause(id);
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: 'paused' } : c));
  };

  const handleDeleteClick = (e, campaign) => {
    e.stopPropagation();
    setDeleteTarget(campaign);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const success = await deleteCampaign(deleteTarget.id);
    setDeleting(false);
    if (success) {
      setCampaigns(campaigns.filter(c => c.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            onClick={() => setDeleteTarget(null)}
          >
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full mx-4"
            >
              <button onClick={() => setDeleteTarget(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">Delete Campaign</h3>
              </div>

              <p className="text-sm text-slate-600 mb-2">
                Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteTarget.name}"</span>?
              </p>
              <p className="text-xs text-slate-400 mb-6">
                This will permanently remove the campaign and all its message data. This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-end">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDeleteTarget(null)}
                  className="btn-secondary text-sm py-2"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold shadow-md transition-all disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} /> Delete
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {tabs.map(t => (
            <button key={t.value} onClick={() => setStatusFilter(t.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === t.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              {t.label}
              {t.value === '' && campaigns.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md font-mono">{campaigns.length}</span>
              )}
            </button>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/campaigns/new')}
          className="btn-primary"
        >
          <Plus size={16} /> New Campaign
        </motion.button>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-4xl mb-4"
          >📬</motion.div>
          <p className="text-slate-400 mb-4">No campaigns found</p>
          <button onClick={() => navigate('/campaigns/new')} className="btn-primary"><Plus size={16} /> Create your first campaign</button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {campaigns.map((c, i) => {
              const sc = getStatusColor(c.status);
              const openRate = c.predicted_open_rate || 0;
              const canDelete = ['completed', 'draft', 'paused'].includes(c.status);
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/campaigns/${c.id}`)}
                  className="card-interactive p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`badge text-xs ${sc.bg} ${sc.text} border ${sc.border}`}>
                        {c.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {c.status}
                      </span>
                      <span className="badge badge-neutral text-xs">{getChannelIcon(c.channel)} {c.channel}</span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-slate-900 mb-1">{c.name || 'Untitled Campaign'}</h3>
                  <p className="text-xs text-slate-400 mb-4">{c.launched_at ? `Launched ${formatDate(c.launched_at)}` : `Created ${formatDate(c.created_at)}`}</p>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500">Open Rate</span>
                      <span className="font-semibold text-slate-700">{formatPercent(openRate)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(openRate * 100, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <span className="text-xs text-slate-500">Reach: <span className="font-semibold text-slate-700">{c.predicted_reach || 0}</span></span>
                      <span className="text-xs text-slate-500">Revenue: <span className="font-mono font-semibold text-slate-700">{formatCurrency(c.predicted_revenue)}</span></span>
                    </div>
                    <div className="flex gap-1">
                      {c.status === 'running' && (
                        <motion.button whileHover={{ scale: 1.15 }} onClick={(e) => handlePause(e, c.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors" title="Pause">
                          <Pause size={14} />
                        </motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.15 }} onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${c.id}`); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-500 transition-colors" title="View">
                        <Eye size={14} />
                      </motion.button>
                      {canDelete && (
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          onClick={(e) => handleDeleteClick(e, c)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
