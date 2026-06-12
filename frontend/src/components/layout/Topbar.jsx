import { useState, useEffect } from 'react';
import { Search, Bell, Sparkles, Command, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const pageTitles = {
  '/': 'Dashboard',
  '/customers': 'Customers',
  '/orders': 'Orders',
  '/segments': 'Segments',
  '/ai': 'AI Command Center',
  '/campaigns': 'Campaigns',
  '/campaigns/new': 'New Campaign',
  '/analytics': 'Analytics',
};

const pageDescriptions = {
  '/': 'Overview of your marketing performance',
  '/customers': 'Manage and analyze your customer base',
  '/orders': 'Track orders and revenue',
  '/segments': 'Build and discover audiences',
  '/ai': 'Chat with PulseAI to build strategies',
  '/campaigns': 'Manage all your campaigns',
  '/campaigns/new': 'Build an AI-powered campaign',
  '/analytics': 'Deep dive into your metrics',
};

const searchSuggestions = [
  { label: 'Go to AI Command', path: '/ai', icon: '🤖' },
  { label: 'Create Campaign', path: '/campaigns/new', icon: '🚀' },
  { label: 'View Customers', path: '/customers', icon: '👥' },
  { label: 'Analytics Dashboard', path: '/analytics', icon: '📊' },
  { label: 'Segment Builder', path: '/segments', icon: '🎯' },
  { label: 'Order History', path: '/orders', icon: '📦' },
];

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const title = pageTitles[location.pathname] || 'PulseAI';
  const desc = pageDescriptions[location.pathname] || '';

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = searchQuery.trim()
    ? searchSuggestions.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchSuggestions;

  return (
    <>
      <header className="sticky top-0 z-40"
        style={{
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 1px 12px rgba(0, 0, 0, 0.03), inset 0 -1px 0 rgba(255,255,255,0.4)',
        }}
      >
        {/* Top light refraction */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        <div className="flex items-center justify-between h-16 px-8">
          {/* Page Title */}
          <motion.div
            key={title}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-display font-bold text-slate-900">{title}</h2>
            <p className="text-[11px] text-slate-400 -mt-0.5">{desc}</p>
          </motion.div>

          {/* Right Section */}
          <div className="flex items-center gap-2.5">
            {/* Search Trigger - Glass */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 pl-4 pr-3 py-2 rounded-xl text-sm w-56 transition-all group"
              style={{
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.4)',
                backdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
              }}
            >
              <Search size={14} className="text-slate-400 group-hover:text-primary-400 transition-colors" />
              <span className="text-slate-400 flex-1 text-left text-xs">Search anything...</span>
              <kbd className="text-[9px] font-mono text-slate-400 bg-white/60 border border-white/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Command size={9} />K
              </kbd>
            </motion.button>

            {/* AI Status - Glass Pill */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/ai')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.06))',
                border: '1px solid rgba(99,102,241,0.15)',
                backdropFilter: 'blur(8px)',
                color: '#4F46E5',
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
              >
                <Sparkles size={13} />
              </motion.div>
              <span>AI Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </motion.button>

            {/* Notifications - Glass Circle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="relative p-2.5 rounded-xl text-slate-500 transition-all"
              style={{
                background: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <Bell size={17} />
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500"
                style={{ boxShadow: '0 0 6px rgba(99,102,241,0.4)' }}
              />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Command Palette Modal - Glass */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
            onClick={() => setSearchOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-md" />

            {/* Panel - Glass */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.82)',
                backdropFilter: 'blur(24px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '20px',
                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              {/* Top light line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />

              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(226,232,240,0.4)' }}>
                <Search size={18} className="text-slate-400" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search pages, commands..."
                  className="flex-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 bg-transparent"
                />
                <button onClick={() => setSearchOpen(false)} className="p-1 rounded-lg hover:bg-slate-100/50 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No results found</p>
                ) : (
                  filtered.map((item, i) => (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => { navigate(item.path); setSearchOpen(false); setSearchQuery(''); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group"
                      style={{ background: 'transparent' }}
                      whileHover={{ backgroundColor: 'rgba(99,102,241,0.06)' }}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-primary-600 transition-colors">{item.label}</span>
                      <span className="ml-auto text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Enter ↵</span>
                    </motion.button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 flex items-center gap-4 text-[10px] text-slate-400"
                style={{ borderTop: '1px solid rgba(226,232,240,0.4)' }}
              >
                <span className="flex items-center gap-1"><kbd className="bg-white/50 px-1.5 py-0.5 rounded font-mono border border-white/30">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/50 px-1.5 py-0.5 rounded font-mono border border-white/30">↵</kbd> Open</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/50 px-1.5 py-0.5 rounded font-mono border border-white/30">Esc</kbd> Close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
