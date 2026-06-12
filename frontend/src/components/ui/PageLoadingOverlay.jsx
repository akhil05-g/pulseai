import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function PageLoadingOverlay({ text = 'Loading', subtext = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-white/60" />

      {/* Loading content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Animated rings */}
        <div className="relative w-20 h-20 mb-6">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-200"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-primary-500 border-r-primary-300"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-accent-400 border-l-accent-300"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border border-transparent border-t-pink-400"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <Sparkles size={20} className="text-primary-500" />
            </motion.div>
          </div>
        </div>

        {/* Text */}
        <motion.p
          className="text-sm font-display font-bold text-slate-700"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {text}
        </motion.p>
        {subtext && (
          <p className="text-xs text-slate-400 mt-1">{subtext}</p>
        )}

        {/* Dot animation */}
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary-400"
              animate={{ scale: [0.5, 1.3, 0.5], opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.12, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
