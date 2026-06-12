import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { customersAPI } from '../../api/customers';
import { formatCurrency, formatDate, getChurnColor, getInitials } from '../../utils/format';

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customersAPI.getProfile(id).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;
  if (!data) return <p className="text-slate-400">Customer not found.</p>;

  const { customer: c, ai_profile, orders = [], journey = [] } = data;
  const churn = getChurnColor(c.churn_risk);

  const funnelStages = ['sent', 'delivered', 'opened', 'clicked', 'purchased'];
  const journeyCounts = {};
  funnelStages.forEach(s => journeyCounts[s] = journey.filter(j => j.status === s || (funnelStages.indexOf(j.status) >= funnelStages.indexOf(s) && j[`${s === 'sent' ? 'sent' : s}_at`])).length);

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/customers')} className="btn-ghost mb-4"><ArrowLeft size={16} /> Back to customers</button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="space-y-4">
          <div className="card p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              {getInitials(c.name)}
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900">{c.name}</h2>
            <span className={`badge mt-2 ${churn.bg} ${churn.text} border ${churn.border}`}>{c.churn_risk} risk</span>

            <div className="mt-5 space-y-3 text-left">
              {c.email && <div className="flex items-center gap-3 text-sm"><Mail size={14} className="text-slate-400" /><span className="text-slate-600">{c.email}</span></div>}
              {c.phone && <div className="flex items-center gap-3 text-sm"><Phone size={14} className="text-slate-400" /><span className="text-slate-600">{c.phone}</span></div>}
              {c.city && <div className="flex items-center gap-3 text-sm"><MapPin size={14} className="text-slate-400" /><span className="text-slate-600">{c.city}</span></div>}
              <div className="flex items-center gap-3 text-sm"><Calendar size={14} className="text-slate-400" /><span className="text-slate-600">Joined {formatDate(c.join_date)}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100">
              <div><p className="stat-number text-lg">{formatCurrency(c.lifetime_value)}</p><p className="text-xs text-slate-400 mt-0.5">Lifetime Value</p></div>
              <div><p className="stat-number text-lg">{c.total_orders}</p><p className="text-xs text-slate-400 mt-0.5">Total Orders</p></div>
            </div>
          </div>

          {/* AI Profile */}
          <div className="card p-5 border-primary-200 bg-primary-50/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-primary-500" />
              <h3 className="font-display font-bold text-sm text-primary-700">AI Profile</h3>
            </div>
            <p className="text-sm text-slate-600 mb-3">{ai_profile?.summary}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-slate-500">Preferred Channel</span><span className="font-semibold text-slate-700">{c.preferred_channel}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Favorite Category</span><span className="font-semibold text-slate-700">{c.favorite_category}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Purchase Frequency</span><span className="font-semibold text-slate-700">Every {c.purchase_frequency_days}d</span></div>
              {ai_profile?.engagement_score !== undefined && (
                <div className="flex justify-between text-xs"><span className="text-slate-500">Engagement Score</span><span className="font-semibold text-primary-600">{ai_profile.engagement_score}/100</span></div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2">
          <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl w-fit">
            {['orders', 'journey'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {t === 'orders' ? `Orders (${orders.length})` : `Journey (${journey.length})`}
              </button>
            ))}
          </div>

          {tab === 'orders' && (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead><tr>{['Order ID', 'Amount', 'Category', 'Status', 'Date'].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr></thead>
                <tbody>
                  {orders.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">No orders</td></tr> :
                    orders.map(o => (
                      <tr key={o.id} className="table-row">
                        <td className="p-3 font-mono text-sm text-primary-600">{o.order_ref}</td>
                        <td className="p-3 font-mono text-sm font-semibold">{formatCurrency(o.amount)}</td>
                        <td className="p-3 text-sm text-slate-600">{o.category}</td>
                        <td className="p-3"><span className={`badge ${o.status === 'completed' ? 'badge-success' : o.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{o.status}</span></td>
                        <td className="p-3 text-sm text-slate-500">{formatDate(o.created_at)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'journey' && (
            <div className="card p-6">
              <h3 className="font-display font-bold text-slate-900 mb-4">Campaign Journey Funnel</h3>
              <div className="space-y-3">
                {funnelStages.map((stage, i) => {
                  const count = journey.filter(j => funnelStages.indexOf(j.status) >= i).length;
                  const pct = journey.length > 0 ? (count / journey.length * 100) : 0;
                  const colors = ['bg-slate-400', 'bg-blue-400', 'bg-primary-400', 'bg-amber-400', 'bg-emerald-400'];
                  return (
                    <div key={stage} className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-slate-500 w-20 capitalize">{stage}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden">
                        <div className={`h-full ${colors[i]} rounded-full transition-all duration-700 flex items-center justify-end pr-3`} style={{ width: `${Math.max(pct, 5)}%` }}>
                          <span className="text-[10px] font-bold text-white">{count}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-500 w-12 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
