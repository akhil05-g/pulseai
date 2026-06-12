import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [brandName, setBrandName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await register(email, password, brandName);
    if (success) navigate('/onboarding');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900">PulseAI</h1>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-2 text-center">Create your account</h2>
          <p className="text-slate-500 text-center mb-8">Start building AI-powered campaigns</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Brand Name</label>
              <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)}
                className="input-field" placeholder="e.g. UrbanKicks" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" placeholder="you@company.com" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? 'Creating...' : <><span>Get Started</span> <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-500 text-sm">
            Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
