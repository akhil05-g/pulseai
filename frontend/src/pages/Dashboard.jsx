import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, IndianRupee, Activity, AlertTriangle, Megaphone, ArrowRight, Sparkles, TrendingUp, Zap, ArrowUpRight, BarChart2, Target, Shield, Globe as GlobeIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../api/analytics';
import { campaignsAPI } from '../api/campaigns';
import { formatCurrency, formatNumber, getStatusColor, getChannelIcon } from '../utils/format';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Globe from '../components/ui/Globe';
import MarketTicker from '../components/ui/MarketTicker';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboardStats().then(r => setStats(r.data)),
      analyticsAPI.getDashboardOpportunities().then(r => setOpportunities(r.data.opportunities || [])),
      analyticsAPI.getRevenueTrend().then(r => setRevenueTrend(r.data.trend || [])),
      campaignsAPI.list().then(r => setCampaigns((r.data.campaigns || []).slice(0, 5))),
    ]).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Customers', rawValue: stats.total_customers || 0, icon: Users, iconBg: 'bg-primary-500/10', iconColor: 'text-primary-500', glowColor: '#6366F1', trend: '+12%' },
    { label: 'Total Revenue', rawValue: stats.total_revenue || 0, prefix: '₹', icon: IndianRupee, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', glowColor: '#10B981', trend: '+8.5%' },
    { label: 'Active (30d)', rawValue: stats.active_customers || 0, icon: Activity, iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-500', glowColor: '#06B6D4' },
    { label: 'At-Risk', rawValue: stats.at_risk || 0, icon: AlertTriangle, iconBg: 'bg-red-500/10', iconColor: 'text-red-500', glowColor: '#EF4444' },
    { label: 'Campaigns', rawValue: stats.total_campaigns || 0, icon: Megaphone, iconBg: 'bg-violet-500/10', iconColor: 'text-violet-500', glowColor: '#8B5CF6' },
  ];

  const oppColorMap = {
    red: { border: 'border-l-red-400', icon: 'bg-red-100 text-red-500' },
    amber: { border: 'border-l-amber-400', icon: 'bg-amber-100 text-amber-500' },
    indigo: { border: 'border-l-primary-400', icon: 'bg-primary-100 text-primary-500' },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-64 rounded-2xl" />
        <div className="grid grid-cols-5 gap-4 stagger-children">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 skeleton h-72 rounded-2xl" />
          <div className="col-span-2 skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ── Hero Section with Globe ── */}
      <motion.div variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/[0.06]"
      >
        {/* Background grids */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Radial glow */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[100px]" />

        <div className="relative z-10 flex items-center justify-between p-8 min-h-[280px]">
          {/* Left Content */}
          <div className="flex-1 max-w-lg">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">AI Engine Active</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-display font-extrabold text-white mb-3 leading-tight"
            >
              Welcome back! 👋<br />
              <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent bg-[length:200%] animate-[gradientSlide_3s_linear_infinite]">
                Your marketing command center
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 text-sm mb-6 leading-relaxed"
            >
              PulseAI has analyzed <span className="text-white font-semibold">{formatNumber(stats.total_customers || 50)} customers</span> and found{' '}
              <span className="text-amber-400 font-semibold">{stats.at_risk || 8} at-risk</span> users. Let's fix that.
            </motion.p>

            {/* Quick stat pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 mb-6"
            >
              {[
                { label: 'Open Rate', value: '82%', icon: '📬' },
                { label: 'CTR', value: '45%', icon: '🖱️' },
                { label: 'Revenue', value: formatCurrency(stats.total_revenue || 0), icon: '💰' },
              ].map((pill, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-2.5"
                >
                  <span className="text-sm">{pill.icon}</span>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">{pill.label}</p>
                    <p className="text-sm font-mono font-bold text-white">{pill.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/ai')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-semibold shadow-lg"
              >
                <Sparkles size={16} /> Ask PulseAI <ArrowRight size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/campaigns/new')}
                className="flex items-center gap-2 px-6 py-3 bg-white/[0.06] backdrop-blur-sm border border-white/[0.1] text-white rounded-xl text-sm font-semibold hover:bg-white/[0.1] transition-colors"
              >
                <Megaphone size={16} /> New Campaign
              </motion.button>
            </motion.div>
          </div>

          {/* Right: Globe */}
          <div className="hidden lg:block relative">
            <Globe size={300} />
            {/* Connected brands badges around globe */}
            {[
              { name: 'WhatsApp', x: -20, y: 40, color: 'bg-emerald-500' },
              { name: 'Email', x: 280, y: 80, color: 'bg-blue-500' },
              { name: 'SMS', x: 240, y: 240, color: 'bg-amber-500' },
              { name: 'RCS', x: 10, y: 220, color: 'bg-purple-500' },
            ].map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.15, type: 'spring' }}
                className="absolute"
                style={{ left: badge.x, top: badge.y }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2 + i * 0.5, ease: 'easeInOut' }}
                  className="flex items-center gap-1.5 bg-white/[0.08] backdrop-blur-md border border-white/[0.1] rounded-lg px-2.5 py-1.5"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.color}`} />
                  <span className="text-[10px] font-semibold text-white/70">{badge.name}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            variants={item}
            className="card stat-card-glow p-5 group"
            style={{ '--glow-color': s.glowColor }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">{s.label}</span>
              <motion.div
                className={`p-2 rounded-xl ${s.iconBg} group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: 12 }}
              >
                <s.icon size={16} className={s.iconColor} />
              </motion.div>
            </div>
            <div className="stat-number text-2xl">
              <AnimatedCounter value={s.rawValue} prefix={s.prefix || ''} duration={1400} />
            </div>
            {s.trend && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-1 text-emerald-500 text-xs font-semibold mt-2"
              >
                <TrendingUp size={12} />{s.trend} <ArrowUpRight size={10} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── AI Opportunities ── */}
      <motion.div variants={item} className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="p-1.5 bg-primary-100 rounded-lg"
            >
              <Sparkles size={16} className="text-primary-600" />
            </motion.div>
            <h3 className="font-display font-bold text-lg text-slate-900">AI Opportunities</h3>
            <span className="badge badge-info text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              Live
            </span>
          </div>
          <button onClick={() => navigate('/ai')} className="text-xs text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1 group">
            Ask AI <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {opportunities.map((opp, i) => {
            const colors = oppColorMap[opp.color] || oppColorMap.indigo;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`card-interactive p-5 border-l-4 ${colors.border}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <motion.span className="text-xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                  >{opp.icon}</motion.span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500">{opp.tag}</span>
                </div>
                <h4 className="font-display font-bold text-slate-900 mb-1.5">{opp.title}</h4>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{opp.description}</p>
                <button onClick={() => navigate('/campaigns/new')} className="text-sm text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1.5 group">
                  {opp.action} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Revenue Trend + Recent Campaigns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div variants={item} className="lg:col-span-3 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-slate-900">Revenue Trend</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500" />
              <span className="text-xs text-slate-500">Revenue</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2.5} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-slate-900">Recent Campaigns</h3>
            <button onClick={() => navigate('/campaigns')} className="text-xs text-primary-600 font-semibold hover:text-primary-700">View all</button>
          </div>
          <div className="space-y-2">
            {campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3"
                >
                  <Megaphone size={20} className="text-slate-400" />
                </motion.div>
                <p className="text-sm text-slate-400">No campaigns yet</p>
                <button onClick={() => navigate('/campaigns/new')} className="text-xs text-primary-600 font-semibold mt-2 hover:text-primary-700">Create one →</button>
              </div>
            ) : (
              campaigns.map((c, i) => {
                const sc = getStatusColor(c.status);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    onClick={() => navigate(`/campaigns/${c.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all group"
                    whileHover={{ x: 4 }}
                  >
                    <span className="text-lg">{getChannelIcon(c.channel)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary-600 transition-colors">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.channel} · {formatCurrency(c.predicted_revenue)}</p>
                    </div>
                    <span className={`badge text-[10px] ${sc.bg} ${sc.text} ${sc.border}`}>
                      {c.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {c.status}
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Performance + Quick Actions ── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Stats (Xeno-style) */}
        <div className="card overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/[0.06]">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                <Shield size={16} className="text-white/60" />
              </div>
              <h3 className="font-display font-bold text-white">Platform Performance</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Delivery Speed', value: 'Lightning Fast', icon: Zap, metric: '< 2s', color: 'text-emerald-400', barColor: 'bg-emerald-500', barWidth: '95%' },
                { label: 'Open Rate', value: 'Industry Leading', icon: Target, metric: '82%', color: 'text-primary-400', barColor: 'bg-primary-500', barWidth: '82%' },
                { label: 'AI Accuracy', value: 'High Precision', icon: Sparkles, metric: '99.2%', color: 'text-cyan-400', barColor: 'bg-cyan-500', barWidth: '99%' },
                { label: 'Uptime', value: 'Always On', icon: Activity, metric: '100%', color: 'text-amber-400', barColor: 'bg-amber-500', barWidth: '100%' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon size={16} className={stat.color} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white/80">{stat.label}</span>
                      <span className={`text-sm font-mono font-bold ${stat.color}`}>{stat.metric}</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${stat.barColor} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: stat.barWidth }}
                        transition={{ delay: 1 + i * 0.15, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          {[
            { icon: Sparkles, label: 'AI Command Center', desc: 'Chat with PulseAI to build data-driven strategies', path: '/ai', color: 'from-primary-500 to-accent-500', stats: 'Memory: 3 campaigns' },
            { icon: Megaphone, label: 'Create Campaign', desc: 'Launch an AI-crafted campaign in 60 seconds', path: '/campaigns/new', color: 'from-pink-500 to-rose-500', stats: 'Multi-channel' },
            { icon: BarChart2, label: 'Deep Analytics', desc: 'Revenue trends, channel comparison, funnel analysis', path: '/analytics', color: 'from-amber-500 to-orange-500', stats: 'Real-time' },
          ].map((action, i) => (
            <motion.button
              key={i}
              onClick={() => navigate(action.path)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ x: 6, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              className="card-interactive p-5 text-left group flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                <action.icon size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-display font-bold text-slate-900 text-sm group-hover:text-primary-600 transition-colors">{action.label}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{action.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{action.stats}</span>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Market Ticker (floating corner) */}
      <MarketTicker />
    </motion.div>
  );
}
