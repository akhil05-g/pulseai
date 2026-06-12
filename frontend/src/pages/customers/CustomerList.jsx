import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { customersAPI } from '../../api/customers';
import { formatCurrency, formatDate, getChurnColor, getInitials } from '../../utils/format';

const filters = [
  { label: 'All', value: '' },
  { label: 'Top Spenders', value: 'top' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'At Risk', value: 'high_risk' },
  { label: 'New', value: 'new' },
];

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    customersAPI.list({ search, filter, page, per_page: 15 })
      .then(r => {
        setCustomers(r.data.customers || []);
        setTotal(r.data.total || 0);
        setPages(r.data.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [search, filter, page]);

  const gradients = [
    'from-primary-400 to-primary-600', 'from-accent-400 to-accent-600',
    'from-pink-400 to-pink-600', 'from-emerald-400 to-emerald-600',
    'from-amber-400 to-amber-600', 'from-violet-400 to-violet-600',
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search customers..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
              className={`chip ${filter === f.value ? 'active' : ''}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Customer', 'Email', 'City', 'LTV', 'Orders', 'Churn Risk', 'Last Purchase'].map(h => (
                  <th key={h} className="table-header text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="p-3"><div className="skeleton h-10 rounded-lg" /></td></tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No customers found</td></tr>
              ) : (
                customers.map((c, i) => {
                  const churn = getChurnColor(c.churn_risk);
                  return (
                    <tr key={c.id} onClick={() => navigate(`/customers/${c.id}`)} className="table-row cursor-pointer">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white text-xs font-bold`}>
                            {getInitials(c.name)}
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">{c.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{c.email}</td>
                      <td className="p-4 text-sm text-slate-500">{c.city}</td>
                      <td className="p-4 font-mono text-sm font-semibold text-slate-900">{formatCurrency(c.lifetime_value)}</td>
                      <td className="p-4 font-mono text-sm text-slate-600">{c.total_orders}</td>
                      <td className="p-4">
                        <span className={`badge ${churn.bg} ${churn.text} border ${churn.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${churn.dot}`} />
                          {c.churn_risk}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{formatDate(c.last_purchase_date)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">{total} customers total</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <span className="text-sm font-medium text-slate-700">Page {page} of {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
