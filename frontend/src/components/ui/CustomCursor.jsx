import { useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const ringX = useSpring(cursorX, { damping: 25, stiffness: 200, mass: 0.5 });
  const ringY = useSpring(cursorY, { damping: 25, stiffness: 200, mass: 0.5 });
  const trailX = useSpring(cursorX, { damping: 18, stiffness: 120, mass: 0.8 });
  const trailY = useSpring(cursorY, { damping: 18, stiffness: 120, mass: 0.8 });
  const isHovering = useRef(false);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef(null);

  useEffect(() => {
    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const addHover = () => {
      isHovering.current = true;
      if (dotRef.current) dotRef.current.style.transform = 'translate(-50%, -50%) scale(0.5)';
      if (ringRef.current) {
        ringRef.current.style.width = '50px';
        ringRef.current.style.height = '50px';
        ringRef.current.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        ringRef.current.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
      }
    };

    const removeHover = () => {
      isHovering.current = false;
      if (dotRef.current) dotRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
      if (ringRef.current) {
        ringRef.current.style.width = '36px';
        ringRef.current.style.height = '36px';
        ringRef.current.style.borderColor = 'rgba(99, 102, 241, 0.2)';
        ringRef.current.style.backgroundColor = 'transparent';
      }
    };

    window.addEventListener('mousemove', move);

    // Observe for hoverable elements
    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [role="button"], input, textarea, select, .card-interactive, .chip, .btn-primary, .btn-secondary, .sidebar-item').forEach(el => {
        el.removeEventListener('mouseenter', addHover);
        el.removeEventListener('mouseleave', removeHover);
        el.addEventListener('mouseenter', addHover);
        el.addEventListener('mouseleave', removeHover);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial bind
    document.querySelectorAll('a, button, [role="button"], input, textarea, select, .card-interactive, .chip').forEach(el => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });

    return () => {
      window.removeEventListener('mousemove', move);
      observer.disconnect();
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Inner dot */}
      <motion.div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-difference"
        style={{ x: cursorX, y: cursorY }}
      >
        <div className="w-2 h-2 -ml-1 -mt-1 rounded-full bg-white" />
      </motion.div>

      {/* Ring follower */}
      <motion.div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9997]"
        style={{
          x: ringX,
          y: ringY,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1.5px solid rgba(99, 102, 241, 0.2)',
          marginLeft: -18,
          marginTop: -18,
          transition: 'width 0.3s, height 0.3s, border-color 0.3s, background-color 0.3s',
        }}
      />

      {/* Ghost trail */}
      <motion.div
        ref={trailRef}
        className="fixed top-0 left-0 pointer-events-none z-[9996]"
        style={{
          x: trailX,
          y: trailY,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          marginLeft: -4,
          marginTop: -4,
        }}
      />

      {/* Hide default cursor globally */}
      <style>{`
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>
    </>
  );
}
