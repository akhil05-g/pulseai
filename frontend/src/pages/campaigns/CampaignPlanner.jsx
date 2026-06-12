import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Rocket, BookOpen, Zap, Users, MessageSquare, Target, CheckCircle } from 'lucide-react';
import { segmentsAPI } from '../../api/segments';
import { campaignsAPI } from '../../api/campaigns';
import { formatCurrency, formatPercent, formatNumber, getChannelIcon } from '../../utils/format';
import useCampaignStore from '../../store/campaignStore';
import AnimatedCounter from '../../components/ui/AnimatedCounter';

const goalSuggestions = [
  { text: 'Bring back inactive customers', emoji: '🔥' },
  { text: 'Reward loyal customers', emoji: '⭐' },
  { text: 'Promote new collection', emoji: '✨' },
  { text: 'Drive repeat purchases', emoji: '🔄' },
];

export default function CampaignPlanner() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [segmentId, setSegmentId] = useState(null);
  const [segments, setSegments] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const navigate = useNavigate();
  const { launchCampaign } = useCampaignStore();

  useEffect(() => {
    segmentsAPI.list().then(r => setSegments(r.data.segments || []));
  }, []);

  const loadingSteps = [
    { icon: <Target size={18} />, text: 'Analyzing your audience...', color: 'text-primary-400' },
    { icon: <BookOpen size={18} />, text: 'Checking campaign memory...', color: 'text-cyan-400' },
    { icon: <MessageSquare size={18} />, text: 'Crafting your message...', color: 'text-amber-400' },
    { icon: <Sparkles size={18} />, text: 'Generating predictions...', color: 'text-emerald-400' },
  ];

  const handleCreateCampaign = async () => {
    if (!segmentId || !goal) return;
    setLoading(true);
    setStep(2);

    for (let i = 0; i < loadingSteps.length; i++) {
      setLoadingStep(i);
      await new Promise(r => setTimeout(r, 900));
    }

    try {
      const res = await campaignsAPI.create({ segment_id: segmentId, goal });
      setCampaign(res.data.campaign);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleLaunch = async () => {
    if (!campaign) return;
    setLaunching(true);
    const result = await launchCampaign(campaign.id);
    setLaunching(false);
    if (result) {
      setLaunched(true);
      setTimeout(() => navigate(`/campaigns/${campaign.id}`), 2000);
    }
  };

  const segGradients = ['from-primary-400 to-primary-600', 'from-pink-400 to-rose-500', 'from-emerald-400 to-emerald-600', 'from-amber-400 to-amber-600'];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-3">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s ? 'bg-primary-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}
              animate={step === s ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.5 }}
              style={step >= s ? { boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' } : {}}
            >
              {step > s ? <CheckCircle size={18} /> : s}
            </motion.div>
            <span className={`text-sm font-medium hidden sm:block ${step >= s ? 'text-slate-900' : 'text-slate-400'}`}>
              {s === 1 ? 'Set Goal' : s === 2 ? 'AI Build' : 'Launch'}
            </span>
            {s < 3 && (
              <motion.div
                className="w-12 h-0.5 rounded-full"
                style={{ background: step > s ? '#6366F1' : '#E2E8F0' }}
                animate={step > s ? { scaleX: [0, 1] } : {}}
                transition={{ duration: 0.4 }}
              />
            )}
          </div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Goal */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card p-8 space-y-6"
          >
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">What's your campaign goal?</h2>
              <p className="text-slate-500">Describe what you want to achieve and PulseAI will build the perfect campaign.</p>
            </div>

            <div>
              <textarea value={goal} onChange={e => setGoal(e.target.value)} rows={3}
                className="input-field resize-none text-base" placeholder="e.g. Bring back customers who haven't purchased in 60+ days with a special discount" />
              <div className="flex flex-wrap gap-2 mt-3">
                {goalSuggestions.map(s => (
                  <motion.button key={s.text} onClick={() => setGoal(s.text)}
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                    className="chip text-xs">
                    <span>{s.emoji}</span> {s.text}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Select Target Audience</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {segments.map((seg, i) => (
                  <motion.button key={seg.id} onClick={() => setSegmentId(seg.id)}
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      segmentId === seg.id ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-slate-200 hover:border-primary-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${segGradients[i % segGradients.length]} flex items-center justify-center`}>
                        <Users size={14} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900">{seg.name}</h4>
                        <p className="text-xs text-slate-500">{formatNumber(seg.customer_count)} customers</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button onClick={handleCreateCampaign} disabled={!goal || !segmentId}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary text-base py-3 px-8">
              Next <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Step 2: AI Building */}
        {step === 2 && loading && (
          <motion.div
            key="step2-loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-12 text-center space-y-6"
          >
            <motion.div
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Sparkles size={32} className="text-primary-500" />
            </motion.div>
            <h3 className="text-xl font-display font-bold text-slate-900">Building your campaign...</h3>
            <div className="space-y-4 max-w-sm mx-auto">
              {loadingSteps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: i <= loadingStep ? 1 : 0.3, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className={`flex items-center gap-3 text-sm ${i <= loadingStep ? 'text-slate-700' : 'text-slate-400'}`}
                >
                  {i < loadingStep ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500"><CheckCircle size={18} /></motion.span>
                  ) : i === loadingStep ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className={s.color}>{s.icon}</motion.span>
                  ) : (
                    <span className="text-slate-300">{s.icon}</span>
                  )}
                  <span className="font-medium">{s.text}</span>
                </motion.div>
              ))}
            </div>
            {/* Progress bar */}
            <div className="w-64 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        {step === 2 && !loading && campaign && (
          <motion.div
            key="step2-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="card p-8">
              <div className="flex items-center gap-2 mb-6">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                  <Sparkles size={18} className="text-primary-500" />
                </motion.div>
                <h3 className="text-xl font-display font-bold text-slate-900">AI Campaign Plan</h3>
                <span className="badge badge-info text-[10px]">AI Generated</span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Channel</label>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{getChannelIcon(campaign.channel)} {campaign.channel}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</label>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{campaign.message_subject}</p>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-6">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</label>
                <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed">
                  {campaign.message_body}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-6">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CTA</label>
                <p className="text-sm font-semibold text-primary-600 mt-1">{campaign.cta}</p>
              </motion.div>

              {campaign.ai_payload?.memory_insight && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="p-4 bg-primary-50 rounded-xl border border-primary-200 animate-border-glow">
                  <div className="flex items-center gap-2 mb-1"><BookOpen size={14} className="text-primary-500" /><span className="text-xs font-bold text-primary-700">Memory Insight</span></div>
                  <p className="text-sm text-slate-600">{campaign.ai_payload.memory_insight}</p>
                </motion.div>
              )}
            </div>

            <div className="flex gap-3">
              <motion.button onClick={() => { setStep(1); setCampaign(null); }} whileTap={{ scale: 0.95 }} className="btn-secondary"><ArrowLeft size={16} /> Edit Goal</motion.button>
              <motion.button onClick={() => setStep(3)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary">Next: Preview <ArrowRight size={16} /></motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Launch */}
        {step === 3 && campaign && !launched && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Reach', value: campaign.predicted_reach || 0, icon: Users },
                { label: 'Open Rate', value: campaign.predicted_open_rate, suffix: '%', multiply: 100, icon: Target },
                { label: 'Revenue', value: campaign.predicted_revenue || 0, prefix: '₹', icon: Zap },
                { label: 'Channel', textValue: `${getChannelIcon(campaign.channel)} ${campaign.channel}`, icon: MessageSquare },
              ].map((s, i) => (
                <motion.div key={i} className="card p-5 text-center stat-card-glow" style={{ '--glow-color': '#6366F1' }}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -3 }}>
                  <p className="text-xs text-slate-500 font-medium mb-1">{s.label}</p>
                  <p className="stat-number text-xl">
                    {s.textValue || <AnimatedCounter value={s.multiply ? s.value * s.multiply : s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} decimals={s.suffix === '%' ? 0 : 0} />}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3">
              <motion.button onClick={() => setStep(2)} whileTap={{ scale: 0.95 }} className="btn-secondary"><ArrowLeft size={16} /> Edit Campaign</motion.button>
              <motion.button onClick={handleLaunch} disabled={launching}
                whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(99, 102, 241, 0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary text-base py-3 px-8">
                {launching ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Launching...
                  </span>
                ) : (
                  <><Rocket size={18} /> Launch Campaign</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Launch Success */}
        {launched && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-16 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
                <Rocket size={36} className="text-emerald-500" />
              </motion.div>
            </motion.div>
            <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Campaign Launched! 🚀</h3>
            <p className="text-slate-500">Redirecting to campaign analytics...</p>
            <motion.div className="w-32 h-1 bg-slate-100 rounded-full mx-auto mt-6 overflow-hidden">
              <motion.div className="h-full bg-emerald-500 rounded-full" animate={{ width: ['0%', '100%'] }} transition={{ duration: 2 }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
