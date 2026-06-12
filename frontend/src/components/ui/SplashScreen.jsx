import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1000);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(() => onFinish?.(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${phase >= 3 ? 'opacity-0 pointer-events-none' : ''}`}
      style={{ transition: 'opacity 0.5s ease' }}>
      {/* Background particles */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className="particle"
          style={{
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            left: Math.random() * 100 + '%',
            background: i % 2 === 0 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(6, 182, 212, 0.4)',
            animationDuration: Math.random() * 6 + 4 + 's',
            animationDelay: Math.random() * 3 + 's',
          }}
        />
      ))}

      {/* Spinning rings */}
      <div className="relative flex items-center justify-center">
        <div className="splash-ring splash-ring-outer absolute" />
        <div className="splash-ring absolute" />
        <div className="splash-logo relative z-10">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg transition-all duration-500 ${phase >= 1 ? 'scale-100' : 'scale-0'}`}
            style={{ boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)' }}>
            <Zap size={32} className="text-white" />
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="splash-text text-center">
        <h1 className={`text-3xl font-display font-extrabold text-white tracking-tight transition-all duration-500 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          PulseAI
        </h1>
        <p className={`text-sm text-slate-400 mt-2 transition-all duration-500 delay-200 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          AI Marketing Strategist
        </p>
      </div>

      {/* Loading bar */}
      <div className="splash-bar">
        <div className="splash-bar-fill" />
      </div>

      {/* Status text */}
      <div className="mt-4 h-5">
        {[
          { text: 'Initializing AI engine...', show: phase >= 1 && phase < 2 },
          { text: 'Loading campaign memory...', show: phase >= 2 && phase < 3 },
          { text: 'Ready ✓', show: phase >= 3 },
        ].map((s, i) => s.show && (
          <p key={i} className="text-xs text-slate-500 animate-fade-in">{s.text}</p>
        ))}
      </div>
    </div>
  );
}
