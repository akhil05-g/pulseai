import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, CheckCircle, XCircle, Lightbulb, Rocket, ArrowRight, Play, Pause, Mail, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { campaignsAPI } from '../../api/campaigns';
import { formatCurrency, formatNumber, formatPercent, formatDate, getStatusColor, getChannelIcon } from '../../utils/format';
import useCampaignStore from '../../store/campaignStore';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState(null);
  const [reflection, setReflection] = useState(null);
  const [actions, setActions] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refLoading, setRefLoading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const { launchCampaign } = useCampaignStore();

  const fetchData = () => {
    return Promise.all([
      campaignsAPI.get(id).then(r => setCampaign(r.data.campaign)),
      campaignsAPI.getAnalytics(id).then(r => { setStats(r.data.stats); if (r.data.campaign) setCampaign(r.data.campaign); }),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleLaunch = async () => {
    setLaunching(true);
    const result = await launchCampaign(id);
    setLaunching(false);
    if (result) {
      setLaunched(true);
      // Refresh data after a short delay
      setTimeout(() => {
        setLaunched(false);
        fetchData();
      }, 2500);
    }
  };

  const handlePause = async () => {
    try {
      await campaignsAPI.pause(id);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const loadReflection = async () => {
    if (reflection) return;
    setRefLoading(true);
    try {
      const [refRes, actRes] = await Promise.all([
        campaignsAPI.getReflection(id),
        campaignsAPI.getNextActions(id),
      ]);
      setReflection(refRes.data.reflection);
      setActions(actRes.data.actions || []);
    } catch (e) { console.error(e); }
    setRefLoading(false);
  };

  useEffect(() => {
    if (tab === 'reflection' || tab === 'actions') loadReflection();
  }, [tab]);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;
  if (!campaign) return <p className="text-slate-400">Campaign not found.</p>;

  const sc = getStatusColor(campaign.status);
  const funnelData = stats ? [
    { stage: 'Sent', count: stats.sent || stats.total || 0 },
    { stage: 'Delivered', count: stats.delivered || 0 },
    { stage: 'Opened', count: stats.opened || 0 },
    { stage: 'Clicked', count: stats.clicked || 0 },
    { stage: 'Purchased', count: stats.purchased || 0 },
  ] : [];

  const urgencyColors = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-info' };

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/campaigns')} className="btn-ghost mb-4"><ArrowLeft size={16} /> Back</button>

      {/* Launch Success Overlay */}
      <AnimatePresence>
        {launched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <div className="absolute inset-0 bg-white/60" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5"
              >
                <Rocket size={36} className="text-emerald-500" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Campaign Launched! 🚀</h3>
              <p className="text-slate-500 text-sm">Messages are being sent to customers now...</p>
              <motion.div className="w-40 h-1.5 bg-slate-100 rounded-full mx-auto mt-5 overflow-hidden">
                <motion.div className="h-full bg-emerald-500 rounded-full" animate={{ width: ['0%', '100%'] }} transition={{ duration: 2 }} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-display font-bold text-slate-900">{campaign.name}</h2>
            <span className={`badge ${sc.bg} ${sc.text} border ${sc.border}`}>
              {campaign.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {campaign.status}
            </span>
            <span className="badge badge-neutral">{getChannelIcon(campaign.channel)} {campaign.channel}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {campaign.status === 'draft' && (
              <motion.button
                onClick={handleLaunch}
                disabled={launching}
                whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(16, 185, 129, 0.25)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {launching ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Rocket size={16} /> Launch Campaign
                  </>
                )}
              </motion.button>
            )}
            {campaign.status === 'running' && (
              <motion.button
                onClick={handlePause}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-all"
              >
                <Pause size={16} /> Pause
              </motion.button>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500">{campaign.goal}</p>
        <p className="text-xs text-slate-400 mt-2">{campaign.launched_at ? `Launched ${formatDate(campaign.launched_at)}` : `Created ${formatDate(campaign.created_at)}`}</p>

        {/* Message Preview for draft */}
        {campaign.status === 'draft' && campaign.message_body && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Mail size={14} className="text-primary-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Preview</span>
            </div>
            {campaign.message_subject && <p className="text-sm font-semibold text-slate-800 mb-1">{campaign.message_subject}</p>}
            <p className="text-sm text-slate-600 leading-relaxed">{campaign.message_body}</p>
            {campaign.cta && (
              <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-600 rounded-lg text-xs font-semibold">{campaign.cta}</span>
            )}
          </motion.div>
        )}
      </div>

      {/* Predicted Stats for Draft */}
      {campaign.status === 'draft' && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Predicted Reach', value: formatNumber(campaign.predicted_reach || 0), icon: '👥' },
            { label: 'Predicted Open Rate', value: formatPercent(campaign.predicted_open_rate || 0), icon: '📬' },
            { label: 'Predicted Revenue', value: formatCurrency(campaign.predicted_revenue || 0), icon: '💰' },
          ].map((m, i) => (
            <motion.div key={i} className="card p-5 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <span className="text-2xl">{m.icon}</span>
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-2">{m.label}</p>
              <p className="stat-number text-xl mt-1">{m.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Live Metrics */}
      {stats && Object.keys(stats).length > 0 && campaign.status !== 'draft' && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Sent', value: stats.sent || stats.total },
            { label: 'Delivered', value: stats.delivered },
            { label: 'Opened', value: stats.opened },
            { label: 'Clicked', value: stats.clicked },
            { label: 'Purchased', value: stats.purchased },
            { label: 'Revenue', value: formatCurrency(stats.revenue) },
          ].map((m, i) => (
            <div key={i} className="card p-4 text-center">
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">{m.label}</p>
              <p className="stat-number text-lg mt-1">{typeof m.value === 'number' ? formatNumber(m.value) : m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
        {['overview', 'reflection', 'actions'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
            {t === 'reflection' && <Sparkles size={13} />}
            {t === 'actions' && <Sparkles size={13} />}
            {t === 'overview' ? 'Overview' : t === 'reflection' ? 'Reflection Report' : 'Next Actions'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && funnelData.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-slate-900 mb-4">Campaign Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 13, fill: '#334155', fontWeight: 500 }} axisLine={false} width={90} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="count" fill="#6366F1" radius={[0, 8, 8, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Reflection Tab */}
      {tab === 'reflection' && (
        <div className="space-y-4">
          {refLoading ? (
            <div className="card p-8 text-center">
              <span className="w-4 h-4 border-2 border-primary-400/30 border-t-primary-500 rounded-full animate-spin inline-block mb-3" />
              <p className="text-sm text-slate-500">Generating AI reflection...</p>
            </div>
          ) : reflection ? (
            <>
              <div className="card p-6 border-l-4 border-l-emerald-400">
                <div className="flex items-center gap-2 mb-3"><CheckCircle size={16} className="text-emerald-500" /><h4 className="font-display font-bold text-slate-900">What Worked</h4></div>
                <p className="text-sm text-slate-600">{reflection.what_worked}</p>
              </div>
              <div className="card p-6 border-l-4 border-l-red-400">
                <div className="flex items-center gap-2 mb-3"><XCircle size={16} className="text-red-500" /><h4 className="font-display font-bold text-slate-900">What Failed</h4></div>
                <p className="text-sm text-slate-600">{reflection.what_failed}</p>
              </div>
              {reflection.recommendations && (
                <div className="card p-6 border-l-4 border-l-primary-400">
                  <div className="flex items-center gap-2 mb-3"><Lightbulb size={16} className="text-primary-500" /><h4 className="font-display font-bold text-slate-900">Recommendations</h4></div>
                  <ul className="space-y-2">
                    {(Array.isArray(reflection.recommendations) ? reflection.recommendations : [reflection.recommendations]).map((r, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><ArrowRight size={14} className="text-primary-400 mt-0.5 flex-shrink-0" />{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="card p-8 text-center text-slate-400">No reflection available yet.</div>
          )}
        </div>
      )}

      {/* Next Actions Tab */}
      {tab === 'actions' && (
        <div className="space-y-3">
          {actions.length === 0 ? (
            <div className="card p-8 text-center text-slate-400">No next actions available.</div>
          ) : (
            actions.map((a, i) => (
              <div key={i} className="card-interactive p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-[10px] ${urgencyColors[a.urgency] || 'badge-neutral'}`}>{a.urgency}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">{a.action}</h4>
                    <p className="text-xs text-slate-500 mt-1">{a.reason}</p>
                  </div>
                  <button onClick={() => navigate('/campaigns/new')} className="btn-ghost text-xs text-primary-600">
                    Build This <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
