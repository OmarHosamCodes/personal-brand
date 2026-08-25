import Magnet from './react-bits/Magnet';
import GlareHover from './react-bits/GlareHover';

type HeroMetricChipProps = {
  value: string;
  label: string;
  live?: boolean;
  positionClass?: string;
};

export default function HeroMetricChip({
  value,
  label,
  live = false,
  positionClass = '',
}: HeroMetricChipProps) {
  return (
    <li className={`hero-metrics__chip relative z-20 m-0 ${positionClass}`.trim()}>
      <Magnet
        padding={96}
        magnetStrength={6}
        activeTransition="transform 0.2s ease-out"
        inactiveTransition="transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)"
      >
        <GlareHover
          width="auto"
          height="auto"
          background="var(--card)"
          borderColor="var(--border)"
          borderRadius="10px"
          glareColor="#E54600"
          glareOpacity={0.32}
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="relative z-[2] flex min-w-[5.5rem] flex-col gap-0.5 px-3.5 py-2">
            <div className="flex items-center gap-1.5">
              {live && (
                <span
                  className="hero-metrics__live size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
              <span className="font-display text-lg font-semibold tabular-nums leading-none tracking-[-0.02em]">
                {value}
              </span>
            </div>
            <span className="font-label text-[10px] text-muted-foreground">
              {label}
            </span>
          </div>
        </GlareHover>
      </Magnet>
    </li>
  );
}
