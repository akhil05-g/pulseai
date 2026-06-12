import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Globe({ size = 320 }) {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = size;
    const H = size;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const R = W * 0.4;
    const cx = W / 2;
    const cy = H / 2;

    // Generate continent-like dots (latitude/longitude grid with gaps for oceans)
    const dots = [];
    const continentMask = (lat, lon) => {
      // Rough landmass shapes for a recognizable globe
      // Asia
      if (lat > 5 && lat < 55 && lon > 60 && lon < 140) return true;
      // Europe
      if (lat > 35 && lat < 60 && lon > -10 && lon < 50) return true;
      // Africa
      if (lat > -35 && lat < 35 && lon > -20 && lon < 50) return true;
      // North America
      if (lat > 15 && lat < 60 && lon > -130 && lon < -60) return true;
      // South America
      if (lat > -55 && lat < 10 && lon > -80 && lon < -35) return true;
      // Australia
      if (lat > -40 && lat < -10 && lon > 110 && lon < 155) return true;
      // India subcontinent (more detail)
      if (lat > 8 && lat < 35 && lon > 68 && lon < 90) return true;
      return false;
    };

    for (let lat = -80; lat <= 80; lat += 4) {
      for (let lon = -180; lon <= 180; lon += 4) {
        if (continentMask(lat, lon) || Math.random() < 0.03) {
          const isLand = continentMask(lat, lon);
          dots.push({
            lat: (lat * Math.PI) / 180,
            lon: (lon * Math.PI) / 180,
            isLand,
          });
        }
      }
    }

    // Ring/orbit points
    const ringDots = [];
    for (let a = 0; a < Math.PI * 2; a += 0.02) {
      ringDots.push(a);
    }

    const draw = () => {
      rotationRef.current += 0.003;
      const rot = rotationRef.current;

      ctx.clearRect(0, 0, W, H);

      // Outer glow
      const glowGrad = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.4);
      glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.03)');
      glowGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.01)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, W, H);

      // Globe outline
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner atmosphere
      const atmoGrad = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R);
      atmoGrad.addColorStop(0, 'transparent');
      atmoGrad.addColorStop(1, 'rgba(99, 102, 241, 0.03)');
      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Draw dots
      dots.forEach((dot) => {
        const x3d = R * Math.cos(dot.lat) * Math.sin(dot.lon + rot);
        const y3d = R * Math.sin(dot.lat);
        const z3d = R * Math.cos(dot.lat) * Math.cos(dot.lon + rot);

        if (z3d < 0) return; // Behind globe

        const screenX = cx + x3d;
        const screenY = cy - y3d;
        const depth = (z3d + R) / (2 * R);
        const dotSize = dot.isLand ? 1.2 + depth * 0.8 : 0.5 + depth * 0.3;
        const alpha = dot.isLand ? 0.15 + depth * 0.7 : 0.05 + depth * 0.15;

        ctx.beginPath();
        ctx.arc(screenX, screenY, dotSize, 0, Math.PI * 2);
        if (dot.isLand) {
          ctx.fillStyle = `rgba(165, 180, 252, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.5})`;
        }
        ctx.fill();
      });

      // Orbit ring
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.15, R * 0.25, -0.4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.06)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Orbiting dot
      const orbAngle = rot * 2;
      const orbX = cx + R * 1.15 * Math.cos(orbAngle);
      const orbY = cy + R * 0.25 * Math.sin(orbAngle);
      const orbZ = Math.sin(orbAngle - 0.4);

      // Only draw orbiting dot when "in front"
      if (orbZ > -0.3) {
        ctx.beginPath();
        ctx.arc(orbX, orbY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
        ctx.fill();

        // Orbiting dot glow
        ctx.beginPath();
        ctx.arc(orbX, orbY, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.fill();
      }

      // Grid lines (latitude circles)
      [-45, 0, 45].forEach((lat) => {
        const latRad = (lat * Math.PI) / 180;
        const ringR = R * Math.cos(latRad);
        const ringY = cy - R * Math.sin(latRad);

        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.05) {
          const px = cx + ringR * Math.sin(a + rot);
          const pz = ringR * Math.cos(a + rot);
          if (pz < 0) continue;
          const alpha = (pz / ringR) * 0.08;
          ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
          ctx.fillRect(px, ringY, 0.8, 0.8);
        }
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [size]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="relative"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{ width: size, height: size }}
      />
    </motion.div>
  );
}
