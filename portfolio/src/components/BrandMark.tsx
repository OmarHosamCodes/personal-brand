interface BrandMarkProps {
  className?: string;
  title?: string;
  /** When true, expose as decorative (aria-hidden). Prefer title for meaningful marks. */
  decorative?: boolean;
  /** When true, centers mark geometry in the 48×48 tile (translate(3, -8)). */
  centered?: boolean;
}

/** Canonical Omar Hosam mark: ink terminal + two kinetic-orange rising slashes (48×48). */
export function BrandMark({
  className = '',
  title = 'Omar Hosam mark',
  decorative = false,
  centered = false,
}: BrandMarkProps) {
  const content = (
    <>
      <circle cx="8" cy="32" r="6" fill="currentColor" />
      <line
        x1="16"
        y1="46"
        x2="28"
        y2="18"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="28"
        y1="46"
        x2="40"
        y2="18"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </>
  );

  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      width="48"
      height="48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
    >
      {centered ? <g transform="translate(3 -8)">{content}</g> : content}
    </svg>
  );
}
