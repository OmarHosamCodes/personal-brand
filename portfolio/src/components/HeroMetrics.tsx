import { site } from '../content/site';
import HeroMetricChip from './HeroMetricChip';
import './HeroMetrics.css';

const positionById: Record<(typeof site.heroMetrics)[number]['id'], string> = {
  experience: 'md:absolute md:top-28 md:left-0 lg:-left-6',
  projects: 'md:absolute md:top-16 md:right-0 lg:-right-6',
  consultation: 'md:absolute md:bottom-28 md:left-0 lg:-left-6',
};

export default function HeroMetrics() {
  return (
    <ul
      className="hero-metrics absolute inset-x-0 bottom-16 z-20 m-0 flex list-none justify-center gap-2 px-3 md:inset-auto md:contents"
      aria-label="Key career metrics"
    >
      {site.heroMetrics.map((metric) => (
        <HeroMetricChip
          key={metric.id}
          value={metric.value}
          label={metric.label}
          live={'live' in metric && metric.live === true}
          positionClass={positionById[metric.id]}
        />
      ))}
    </ul>
  );
}
