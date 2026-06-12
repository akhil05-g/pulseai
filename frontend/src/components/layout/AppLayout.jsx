import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PageLoadingOverlay from '../ui/PageLoadingOverlay';

const pageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.995, filter: 'blur(4px)' },
  animate: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0, y: -10, scale: 0.998, filter: 'blur(2px)',
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

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

export default function AppLayout() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setIsTransitioning(true);
      prevPath.current = location.pathname;
      const timer = setTimeout(() => setIsTransitioning(false), 800);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const pageTitle = pageTitles[location.pathname] || 'PulseAI';

  return (
    <div className="min-h-screen ai-ambient relative"
      style={{
        background: '#F0F2F8',
        backgroundImage: `
          radial-gradient(ellipse at 15% 8%, rgba(99,102,241,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 85% 85%, rgba(6,182,212,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(236,72,153,0.025) 0%, transparent 60%)
        `,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Subtle noise texture overlay for depth */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      <Sidebar />
      <div className="ml-64 relative z-10">
        <Topbar />
        <main className="p-8 relative z-10">
          {/* Page loading overlay */}
          <AnimatePresence>
            {isTransitioning && (
              <PageLoadingOverlay
                text={`Loading ${pageTitle}`}
                subtext="Fetching latest data..."
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
