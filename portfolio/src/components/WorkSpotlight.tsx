import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** Fixed spotlight on project frames; hidden under reduced motion. */
export function WorkSpotlight({
  className,
  x = 50,
  y = 40,
}: {
  className?: string;
  x?: number;
  y?: number;
}) {
  const [reduce, setReduce] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  if (reduce) return null;

  return (
    <div
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{
        background: `radial-gradient(420px circle at ${x}% ${y}%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 55%)`,
      }}
      aria-hidden
    />
  );
}
