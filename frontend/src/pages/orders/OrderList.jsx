import { useState, useEffect } from 'react';
import { Package, IndianRupee, ShoppingCart } from 'lucide-react';
import { ordersAPI } from '../../api/orders';
import { formatCurrency, formatDate } from '../../utils/format';

const categoryOptions = ['All', 'Sneakers', 'Apparel', 'Accessories', 'Streetwear', 'Watches'];

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersAPI.list({ category: category || undefined, page }).then(r => { setOrders(r.data.orders || []); setTotal(r.data.total || 0); }),
      ordersAPI.getStats().then(r => setStats(r.data)),
    ]).finally(() => setLoading(false));
  }, [category, page]);

  const statCards = [
    { label: 'Total Orders', value: stats.total_orders, icon: Package, color: 'primary' },
    { label: 'Total GMV', value: formatCurrency(stats.total_revenue), icon: IndianRupee, color: 'emerald' },
    { label: 'Avg Order Value', value: formatCurrency(stats.avg_order_value), icon: ShoppingCart, color: 'cyan' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stat Row */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.color === 'primary' ? 'bg-primary-100' : s.color === 'emerald' ? 'bg-emerald-100' : 'bg-cyan-100'}`}>
                <s.icon size={18} className={s.color === 'primary' ? 'text-primary-600' : s.color === 'emerald' ? 'text-emerald-600' : 'text-cyan-600'} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                <p className="stat-number text-xl">{s.value ?? '—'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {categoryOptions.map(c => (
          <button key={c} onClick={() => { setCategory(c === 'All' ? '' : c); setPage(1); }}
            className={`chip ${(c === 'All' && !category) || category === c ? 'active' : ''}`}>{c}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr>{['Order ID', 'Customer', 'Amount', 'Category', 'Status', 'Date'].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? [...Array(8)].map((_, i) => <tr key={i}><td colSpan={6} className="p-3"><div className="skeleton h-10 rounded-lg" /></td></tr>) :
              orders.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-slate-400">No orders found</td></tr> :
              orders.map(o => (
                <tr key={o.id} className="table-row">
                  <td className="p-4 font-mono text-sm text-primary-600 font-medium">{o.order_ref}</td>
                  <td className="p-4 text-sm text-slate-600">#{o.customer_id}</td>
                  <td className="p-4 font-mono text-sm font-semibold text-slate-900">{formatCurrency(o.amount)}</td>
                  <td className="p-4"><span className="badge badge-neutral">{o.category}</span></td>
                  <td className="p-4"><span className={`badge ${o.status === 'completed' ? 'badge-success' : o.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{o.status}</span></td>
                  <td className="p-4 text-sm text-slate-500">{formatDate(o.created_at)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
