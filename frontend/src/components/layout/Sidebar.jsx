import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Package, Filter, Sparkles, Megaphone, BarChart2, LogOut, Zap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../utils/format';

const mainNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: Package, label: 'Orders', path: '/orders' },
  { icon: Filter, label: 'Segments', path: '/segments' },
];

const aiNav = [
  { icon: Sparkles, label: 'AI Command', path: '/ai', highlight: true },
  { icon: Megaphone, label: 'Campaigns', path: '/campaigns' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ item, index }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `sidebar-item ${isActive ? 'active' : ''} ${item.highlight ? 'group' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <motion.div whileHover={{ scale: 1.15, rotate: 5 }} transition={{ type: 'spring', stiffness: 400 }}>
            <item.icon size={19} />
          </motion.div>
          <span>{item.label}</span>
          {item.highlight && (
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="ml-auto text-[10px] font-bold bg-gradient-to-r from-primary-500 to-accent-500 text-white px-2 py-0.5 rounded-full shadow-sm"
            >
              AI
            </motion.span>
          )}
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-primary-400"
              style={{ boxShadow: '0 0 12px rgba(129, 140, 248, 0.6)' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-50 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.92) 50%, rgba(15,23,42,0.97) 100%)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Floating glow orbs */}
      <motion.div
        className="absolute top-20 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
        animate={{ y: [0, 30, -20, 0], x: [0, -10, 10, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-32 -left-10 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)' }}
        animate={{ y: [0, -20, 30, 0], x: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 16, ease: 'easeInOut' }}
      />

      {/* Top light refraction line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Logo */}
      <div className="p-6 pb-4 relative z-10">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <motion.div
            whileHover={{ rotate: 20, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center"
            style={{
              boxShadow: '0 0 24px rgba(99, 102, 241, 0.35), 0 0 48px rgba(99, 102, 241, 0.15)',
            }}
          >
            <Zap size={20} className="text-white" />
            {/* Ring pulse */}
            <motion.div
              className="absolute inset-0 rounded-2xl border border-primary-400/30"
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
          </motion.div>
          <div>
            <h1 className="text-lg font-display font-bold text-white tracking-tight">PulseAI</h1>
            <div className="flex items-center gap-1.5 -mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-slate-400 font-medium">AI Engine Active</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 overflow-y-auto mt-2 relative z-10">
        <div className="mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 px-4 mb-2">Main</p>
          {mainNav.map((item, i) => (
            <NavItem key={item.path} item={item} index={i} />
          ))}
        </div>

        <div className="my-4 mx-4 border-t border-white/[0.06]" />

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 px-4 mb-2">Intelligence</p>
          {aiNav.map((item, i) => (
            <NavItem key={item.path} item={item} index={i} />
          ))}
        </div>
      </nav>

      {/* AI Status Glass Card */}
      <div className="px-4 pb-2 relative z-10">
        <motion.div
          className="p-3.5 rounded-xl border border-primary-500/20 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.06) 100%)',
            backdropFilter: 'blur(12px)',
          }}
          whileHover={{ scale: 1.02, borderColor: 'rgba(99,102,241,0.35)' }}
        >
          {/* Inner glass shine */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-400/20 to-transparent" />
          <div className="flex items-center gap-2.5 text-xs">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            >
              <Sparkles size={14} className="text-primary-400" />
            </motion.div>
            <span className="text-primary-300 font-medium">Memory: 3 campaigns</span>
          </div>
        </motion.div>
      </div>

      {/* User Section - Glass */}
      <div className="p-4 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-1">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold relative"
            style={{ boxShadow: '0 0 16px rgba(99,102,241,0.3)' }}
          >
            {getInitials(user?.brand_name || user?.email || 'U')}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.brand_name || 'Brand'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.1, rotate: -10 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </div>
    </aside>
  );
}
