import { useEffect, useRef, useState } from 'react';

export default function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1200, decimals = 0 }) {
  const [displayVal, setDisplayVal] = useState(0);
  const prevVal = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const numVal = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    const startVal = prevVal.current;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (numVal - startVal) * eased;
      setDisplayVal(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevVal.current = numVal;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  const formatted = decimals > 0 ? displayVal.toFixed(decimals) : Math.round(displayVal);
  const display = Number(formatted).toLocaleString('en-IN');

  return (
    <span className="tabular-nums">
      {prefix}{display}{suffix}
    </span>
  );
}
