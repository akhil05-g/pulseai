import { useState, useEffect } from 'react';
import { Send, CheckCircle, Eye, MousePointer, ShoppingCart, IndianRupee } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsAPI } from '../../api/analytics';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/format';

export default function Analytics() {
  const [overview, setOverview] = useState({});
  const [channels, setChannels] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [campaignTrends, setCampaignTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getOverview().then(r => setOverview(r.data)),
      analyticsAPI.getChannelComparison().then(r => setChannels(r.data.channels || [])),
      analyticsAPI.getRevenueTrend().then(r => setRevenueTrend(r.data.trend || [])),
      analyticsAPI.getCampaignTrends().then(r => setCampaignTrends(r.data.trends || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const kpiCards = [
    { label: 'Total Sent', value: formatNumber(overview.total_sent), icon: Send, color: 'slate' },
    { label: 'Delivered', value: formatNumber(overview.delivered), icon: CheckCircle, color: 'blue' },
    { label: 'Opened', value: formatNumber(overview.opened), icon: Eye, color: 'primary' },
    { label: 'Clicked', value: formatNumber(overview.clicked), icon: MousePointer, color: 'amber' },
    { label: 'Converted', value: formatNumber(overview.converted), icon: ShoppingCart, color: 'emerald' },
    { label: 'Revenue', value: formatCurrency(overview.total_revenue), icon: IndianRupee, color: 'violet' },
  ];

  const colorBg = {
    slate: 'bg-slate-100', blue: 'bg-blue-100', primary: 'bg-primary-100',
    amber: 'bg-amber-100', emerald: 'bg-emerald-100', violet: 'bg-violet-100',
  };
  const colorText = {
    slate: 'text-slate-600', blue: 'text-blue-600', primary: 'text-primary-600',
    amber: 'text-amber-600', emerald: 'text-emerald-600', violet: 'text-violet-600',
  };

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((k, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${colorBg[k.color]}`}>
                <k.icon size={14} className={colorText[k.color]} />
              </div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{k.label}</span>
            </div>
            <p className="stat-number text-lg">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-slate-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2.5} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Comparison */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-slate-900 mb-4">Channel Comparison</h3>
          {channels.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">No channel data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={channels}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="channel" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                <Legend />
                <Bar dataKey="sent" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={20} name="Sent" />
                <Bar dataKey="opened" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={20} name="Opened" />
                <Bar dataKey="clicked" fill="#06B6D4" radius={[4, 4, 0, 0]} barSize={20} name="Clicked" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Campaign Performance Table */}
      {campaignTrends.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-display font-bold text-slate-900">Campaign Performance</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr>{['Campaign', 'Open Rate', 'CTR', 'Revenue'].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {campaignTrends.map((t, i) => (
                <tr key={i} className="table-row">
                  <td className="p-4 text-sm font-semibold text-slate-900">{t.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5"><div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${Math.min(t.open_rate * 100, 100)}%` }} /></div>
                      <span className="text-sm font-mono text-slate-600">{formatPercent(t.open_rate)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-mono text-slate-600">{formatPercent(t.ctr)}</td>
                  <td className="p-4 text-sm font-mono font-semibold text-slate-900">{formatCurrency(t.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
