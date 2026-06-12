import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Eye, EyeOff, ArrowRight, BarChart2, Users, Sparkles, TrendingUp, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Rotate featured stat
  useEffect(() => {
    const t = setInterval(() => setActiveFeature(i => (i + 1) % 3), 3000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password);
    if (success) navigate('/');
  };

  const features = [
    { icon: <Users size={22} />, stat: '50+', label: 'Customer profiles managed', color: 'from-primary-400 to-primary-500' },
    { icon: <BarChart2 size={22} />, stat: '82%', label: 'Avg WhatsApp open rate', color: 'from-cyan-400 to-cyan-500' },
    { icon: <Sparkles size={22} />, stat: '3s', label: 'AI churn detection speed', color: 'from-amber-400 to-amber-500' },
  ];

  const testimonials = [
    { text: '"PulseAI doubled our repeat purchase rate in just 3 weeks"', author: 'Priya S., UrbanKicks' },
    { text: '"The AI memory engine is incredible — every campaign gets smarter"', author: 'Rohit K., StyleHub' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex w-[55%] bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 flex-col items-center justify-center p-16 relative overflow-hidden">
        {/* Animated bg orbs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"
          animate={{ x: [0, -20, 30, 0], y: [0, 30, -20, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
        />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{ repeat: Infinity, duration: 3 + Math.random() * 3, delay: Math.random() * 3 }}
          />
        ))}

        <div className="relative z-10 text-center max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 0 30px rgba(255,255,255,0.15)' }}>
              <Zap size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-display font-extrabold text-white tracking-tight">PulseAI</h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-white/80 font-medium mb-10"
          >
            The AI Marketing Strategist
          </motion.p>

          {/* Animated Feature Cards */}
          <div className="space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4 text-left transition-all duration-500 border border-transparent ${
                  activeFeature === i ? 'bg-white/[0.18] border-white/20 shadow-lg scale-[1.02]' : ''
                }`}
              >
                <motion.div
                  className={`p-3 bg-gradient-to-br ${f.color} rounded-xl text-white shadow-md`}
                  animate={activeFeature === i ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  {f.icon}
                </motion.div>
                <div>
                  <span className="text-3xl font-mono font-bold text-white">{f.stat}</span>
                  <p className="text-white/70 text-sm mt-0.5">{f.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-10 p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature % testimonials.length}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <p className="text-sm text-white/70 italic">{testimonials[activeFeature % testimonials.length].text}</p>
                <p className="text-xs text-white/50 mt-2">— {testimonials[activeFeature % testimonials.length].author}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 bg-white relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #6366F1 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-display font-bold text-slate-900">PulseAI</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-display font-bold text-slate-900 mb-2"
          >
            Welcome back
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 mb-8"
          >
            Sign in to your marketing command center
          </motion.p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" placeholder="you@company.com" required />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight size={18} />
                </span>
              )}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-8 text-center text-slate-500 text-sm"
          >
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Create one
            </Link>
          </motion.p>



          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-6 mt-8 text-slate-400"
          >
            <div className="flex items-center gap-1.5 text-xs"><Shield size={12} /> Secure</div>
            <div className="flex items-center gap-1.5 text-xs"><TrendingUp size={12} /> 99.9% Uptime</div>
            <div className="flex items-center gap-1.5 text-xs"><Sparkles size={12} /> AI Powered</div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
