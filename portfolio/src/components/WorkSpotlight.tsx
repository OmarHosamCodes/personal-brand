import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** Fixed spotlight + shimmer while project frame iframes load. */
export function WorkSpotlight({
  src,
  title,
  className,
  x = 50,
  y = 40,
}: {
  src: string;
  title: string;
  className?: string;
  x?: number;
  y?: number;
}) {
  const [reduce, setReduce] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <div className={cn('relative aspect-square overflow-hidden rounded-[16px]', className)}>
      {!loaded && (
        <div
          className="shimmer absolute inset-0 z-20 bg-secondary"
          aria-hidden
        />
      )}

      {!reduce && loaded && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: `radial-gradient(420px circle at ${x}% ${y}%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 55%)`,
          }}
          aria-hidden
        />
      )}

      <iframe
        src={src}
        title={title}
        className={cn(
          'aspect-square h-full w-full border-0 bg-secondary transition-opacity duration-300 ease-(--ease-broadcast)',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
        loading="lazy"
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
