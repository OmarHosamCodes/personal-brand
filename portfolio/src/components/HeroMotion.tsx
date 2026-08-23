import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Ambient kinetic field — mark-slash inspired motion.
 * Fully disabled under prefers-reduced-motion.
 */
export function HeroMotion({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [reduce, setReduce] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const lines = Array.from({ length: 14 }, (_, i) => ({
      x: (i / 14) * w + Math.random() * 40,
      y: h * (0.2 + Math.random() * 0.6),
      len: 40 + Math.random() * 120,
      speed: 0.15 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
    }));

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const line of lines) {
        const drift = Math.sin(t * 0.001 * line.speed + line.phase) * 18;
        const x1 = line.x + drift;
        const y1 = line.y;
        const x2 = x1 + line.len * 0.45;
        const y2 = y1 - line.len;
        ctx.strokeStyle = 'color-mix(in oklch, var(--primary) 28%, transparent)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <canvas
      ref={ref}
      className={cn('pointer-events-none absolute inset-0 opacity-70', className)}
      aria-hidden
    />
  );
}
