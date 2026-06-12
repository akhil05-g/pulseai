import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

function generatePoint(prevY, i, total) {
  const trend = 0.3;
  const volatility = 8;
  const base = 50 - (i / total) * 15;
  const noise = (Math.random() - 0.5) * volatility;
  const y = prevY !== null ? prevY + noise - trend : base + noise;
  return Math.max(10, Math.min(90, y));
}

export default function MarketTicker() {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const frameRef = useRef(null);
  const [price, setPrice] = useState(2847.5);
  const [change, setChange] = useState(2.34);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 220;
    const H = 80;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.scale(2, 2);

    // Init points
    const maxPoints = 60;
    let pts = [];
    let y = 50;
    for (let i = 0; i < maxPoints; i++) {
      y = generatePoint(y, i, maxPoints);
      pts.push(y);
    }
    pointsRef.current = pts;

    let tick = 0;
    const draw = () => {
      tick++;
      if (tick % 3 === 0) {
        const lastY = pts[pts.length - 1];
        const newY = generatePoint(lastY, pts.length, maxPoints);
        pts.push(newY);
        if (pts.length > maxPoints) pts.shift();
        pointsRef.current = pts;

        // Update price
        const delta = (Math.random() - 0.45) * 5;
        setPrice(p => Math.max(2500, p + delta));
        setChange(c => {
          const nc = c + (Math.random() - 0.48) * 0.3;
          return Math.round(nc * 100) / 100;
        });
      }

      ctx.clearRect(0, 0, W, H);

      // Draw grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 5; i++) {
        const gy = (H / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      // Gradient fill
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      if (change >= 0) {
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.strokeStyle = '#10B981';
      } else {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.12)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.strokeStyle = '#EF4444';
      }

      const stepX = W / (maxPoints - 1);

      // Fill area
      ctx.beginPath();
      ctx.moveTo(0, H);
      pts.forEach((p, i) => {
        const x = i * stepX;
        if (i === 0) ctx.lineTo(x, p);
        else {
          const prevX = (i - 1) * stepX;
          const cpx = (prevX + x) / 2;
          ctx.quadraticCurveTo(cpx, pts[i - 1], x, p);
        }
      });
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw line
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      pts.forEach((p, i) => {
        const x = i * stepX;
        if (i === 0) ctx.moveTo(x, p);
        else {
          const prevX = (i - 1) * stepX;
          const cpx = (prevX + x) / 2;
          ctx.quadraticCurveTo(cpx, pts[i - 1], x, p);
        }
      });
      ctx.stroke();

      // Dot at end
      const lastPt = pts[pts.length - 1];
      const lastX = (pts.length - 1) * stepX;
      ctx.beginPath();
      ctx.arc(lastX, lastPt, 3, 0, Math.PI * 2);
      ctx.fillStyle = change >= 0 ? '#10B981' : '#EF4444';
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(lastX, lastPt, 6 + Math.sin(tick * 0.1) * 2, 0, Math.PI * 2);
      ctx.fillStyle = change >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
      ctx.fill();

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-30"
    >
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg p-4 w-[260px] hover:shadow-xl transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center">
              <TrendingUp size={11} className="text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Pulse</span>
          </div>
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-mono font-bold text-slate-900">
            ₹{price.toFixed(1)}
          </span>
          <span className={`text-xs font-bold font-mono ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-[80px] rounded-lg"
          style={{ imageRendering: 'auto' }}
        />

        {/* Bottom tickers */}
        <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-400">
          <span>VOL 1.2M</span>
          <span>24H</span>
          <span>LIVE</span>
        </div>
      </div>
    </motion.div>
  );
}
