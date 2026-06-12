import { useState, useEffect } from 'react';
import { Sparkles, Plus, X, Search, Trash2 } from 'lucide-react';
import { segmentsAPI } from '../../api/segments';
import { formatNumber, formatDate, getInitials } from '../../utils/format';

const fieldOptions = [
  { value: 'lifetime_value', label: 'Lifetime Value' },
  { value: 'total_orders', label: 'Total Orders' },
  { value: 'days_since_purchase', label: 'Days Since Purchase' },
  { value: 'churn_risk', label: 'Churn Risk' },
  { value: 'city', label: 'City' },
];
const opOptions = [
  { value: 'gt', label: '>' }, { value: 'lt', label: '<' },
  { value: 'eq', label: '=' }, { value: 'gte', label: '≥' }, { value: 'lte', label: '≤' },
];

export default function SegmentBuilder() {
  const [mode, setMode] = useState('manual');
  const [segments, setSegments] = useState([]);
  const [name, setName] = useState('');
  const [rules, setRules] = useState([{ field: 'lifetime_value', op: 'gt', value: '' }]);
  const [aiQuery, setAiQuery] = useState('');
  const [preview, setPreview] = useState(null);
  const [reasoning, setReasoning] = useState('');
  const [loading, setLoading] = useState(false);
  const [segLoading, setSegLoading] = useState(true);

  useEffect(() => {
    segmentsAPI.list().then(r => setSegments(r.data.segments || [])).finally(() => setSegLoading(false));
  }, []);

  const addRule = () => setRules([...rules, { field: 'total_orders', op: 'gt', value: '' }]);
  const removeRule = (i) => setRules(rules.filter((_, idx) => idx !== i));
  const updateRule = (i, key, val) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], [key]: val };
    setRules(updated);
  };

  const handleManualPreview = async () => {
    setLoading(true);
    setReasoning('');
    try {
      const res = await segmentsAPI.create({
        name: name || 'Untitled Segment',
        filter_rules: rules.map(r => ({ ...r, value: isNaN(r.value) ? r.value : Number(r.value) })),
      });
      setPreview(null);
      // Refresh segments
      const segs = await segmentsAPI.list();
      setSegments(segs.data.segments || []);
      // Get preview for last created segment
      const sid = res.data.segment?.id;
      if (sid) {
        const prev = await segmentsAPI.preview(sid);
        setPreview({ customers: prev.data.customers || [], total: prev.data.total || 0 });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAiDiscover = async () => {
    if (!aiQuery.trim()) return;
    setLoading(true);
    setReasoning('');
    setPreview(null);
    try {
      const res = await segmentsAPI.aiDiscover(aiQuery);
      setReasoning(res.data.reasoning || res.data.segment?.ai_reasoning || '');
      setPreview({ customers: res.data.customers || [], total: res.data.segment?.customer_count || 0 });
      const segs = await segmentsAPI.list();
      setSegments(segs.data.segments || []);
    } catch (e) {
      setReasoning('AI service unavailable. Please check your Groq API key.');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await segmentsAPI.delete(id);
    setSegments(segments.filter(s => s.id !== id));
  };

  const gradients = ['from-primary-400 to-accent-400', 'from-pink-400 to-primary-400', 'from-emerald-400 to-cyan-400', 'from-amber-400 to-red-400'];

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Builder */}
        <div className="lg:col-span-3 space-y-5">
          {/* Mode Toggle */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button onClick={() => setMode('manual')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              Manual Rules
            </button>
            <button onClick={() => setMode('ai')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'ai' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <Sparkles size={14} /> Ask AI
            </button>
          </div>

          {mode === 'manual' ? (
            <div className="card p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Segment Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="e.g. High Value Churners" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Conditions</label>
                <div className="space-y-3">
                  {rules.map((rule, i) => (
                    <div key={i} className="animate-slide-up">
                      {i > 0 && <div className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-2 ml-1">AND</div>}
                      <div className="flex gap-2 items-center">
                        <select value={rule.field} onChange={e => updateRule(i, 'field', e.target.value)}
                          className="input-field flex-1">
                          {fieldOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                        <select value={rule.op} onChange={e => updateRule(i, 'op', e.target.value)}
                          className="input-field w-20 text-center">
                          {opOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <input value={rule.value} onChange={e => updateRule(i, 'value', e.target.value)}
                          className="input-field flex-1" placeholder="Value" />
                        {rules.length > 1 && (
                          <button onClick={() => removeRule(i)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={addRule} className="btn-ghost mt-3 text-primary-600"><Plus size={14} /> Add Condition</button>
              </div>

              <div className="flex gap-3">
                <button onClick={handleManualPreview} disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : 'Save & Preview'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Describe your audience</label>
                <textarea value={aiQuery} onChange={e => setAiQuery(e.target.value)} rows={3}
                  className="input-field resize-none"
                  placeholder="e.g. Find customers who haven't bought in 60 days and previously spent more than ₹3000" />
              </div>
              <button onClick={handleAiDiscover} disabled={loading} className="btn-primary">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    PulseAI is thinking...
                  </span>
                ) : (
                  <><Sparkles size={16} /> Discover Audience</>
                )}
              </button>
              {reasoning && (
                <div className="p-4 bg-primary-50 rounded-xl border border-primary-200 animate-scale-in">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-primary-500" />
                    <span className="text-sm font-bold text-primary-700">AI Reasoning</span>
                  </div>
                  <p className="text-sm text-slate-600">{reasoning}</p>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="card p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <span className="stat-number text-2xl text-primary-600">{formatNumber(preview.total)}</span>
                <span className="text-sm text-slate-500">customers match</span>
              </div>
              {preview.customers?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr>{['Name', 'City', 'LTV', 'Risk'].map(h => <th key={h} className="table-header text-left text-xs">{h}</th>)}</tr></thead>
                    <tbody>
                      {preview.customers.slice(0, 8).map(c => (
                        <tr key={c.id} className="table-row">
                          <td className="p-3 text-sm font-medium text-slate-900">{c.name}</td>
                          <td className="p-3 text-sm text-slate-500">{c.city}</td>
                          <td className="p-3 text-sm font-mono">{formatNumber(c.lifetime_value)}</td>
                          <td className="p-3"><span className={`badge text-[10px] ${c.churn_risk === 'high' ? 'badge-danger' : c.churn_risk === 'medium' ? 'badge-warning' : 'badge-success'}`}>{c.churn_risk}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Saved Segments */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-bold text-slate-900">Saved Segments</h3>
          {segLoading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />) :
            segments.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No segments yet</p> :
            segments.map((seg, i) => (
              <div key={seg.id} className="card p-4 group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white text-sm`}>
                      {seg.is_ai_generated ? <Sparkles size={16} /> : <Search size={16} />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">{seg.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{formatNumber(seg.customer_count)} customers · {formatDate(seg.created_at)}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(seg.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
                {seg.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{seg.description}</p>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
