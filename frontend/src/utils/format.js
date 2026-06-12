export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0';
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('en-IN');
}

export function formatPercent(value) {
  if (value === null || value === undefined) return '0%';
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateRelative(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function getChurnColor(risk) {
  switch (risk) {
    case 'high': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' };
    case 'medium': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'low': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' };
  }
}

export function getStatusColor(status) {
  switch (status) {
    case 'running': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
    case 'completed': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
    case 'draft': return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' };
    case 'paused': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
    default: return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' };
  }
}

export function getChannelIcon(channel) {
  switch (channel) {
    case 'whatsapp': return '💬';
    case 'email': return '📧';
    case 'sms': return '📱';
    case 'rcs': return '🚀';
    default: return '📨';
  }
}
