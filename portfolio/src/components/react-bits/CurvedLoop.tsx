import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useId,
  type PointerEvent,
} from 'react';
import './CurvedLoop.css';

type CurvedLoopProps = {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: 'left' | 'right';
  interactive?: boolean;
};

export default function CurvedLoop({
  marqueeText = '',
  speed = 2,
  className,
  curveAmount = 400,
  direction = 'left',
  interactive = true,
}: CurvedLoopProps) {
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '\u00A0';
  }, [marqueeText]);

  const measureRef = useRef<SVGTextElement>(null);
  const textPathRef = useRef<SVGTextPathElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const uid = useId();
  const pathId = `curve-${uid.replace(/:/g, '')}`;
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef(direction);
  const velRef = useRef(0);

  const textLength = spacing;
  const totalText = textLength
    ? Array(Math.ceil(1800 / textLength) + 2)
        .fill(text)
        .join('')
    : text;
  const ready = spacing > 0;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (measureRef.current) {
      setSpacing(measureRef.current.getComputedTextLength());
    }
  }, [text, className]);

  useEffect(() => {
    if (!spacing) return;
    if (textPathRef.current) {
      const initial = -spacing;
      textPathRef.current.setAttribute('startOffset', `${initial}px`);
      setOffset(initial);
    }
  }, [spacing]);

  useEffect(() => {
    if (!spacing || !ready || reduceMotion) return;
    let frame = 0;
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === 'right' ? speed : -speed;
        const currentOffset = parseFloat(
          textPathRef.current.getAttribute('startOffset') || '0'
        );
        let newOffset = currentOffset + delta;

        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;

        textPathRef.current.setAttribute('startOffset', `${newOffset}px`);
        setOffset(newOffset);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready, reduceMotion]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || reduceMotion) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || !dragRef.current || !textPathRef.current || reduceMotion) {
      return;
    }
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;

    const currentOffset = parseFloat(
      textPathRef.current.getAttribute('startOffset') || '0'
    );
    let newOffset = currentOffset + dx;

    const wrapPoint = spacing;
    if (newOffset <= -wrapPoint) newOffset += wrapPoint;
    if (newOffset > 0) newOffset -= wrapPoint;

    textPathRef.current.setAttribute('startOffset', `${newOffset}px`);
    setOffset(newOffset);
  };

  const endDrag = () => {
    if (!interactive || reduceMotion) return;
    dragRef.current = false;
    dirRef.current = velRef.current > 0 ? 'right' : 'left';
  };

  const cursorStyle = interactive && !reduceMotion
    ? dragRef.current
      ? 'grabbing'
      : 'grab'
    : 'auto';

  return (
    <div
      className="curved-loop-jacket"
      style={{ visibility: ready ? 'visible' : 'hidden', cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      aria-hidden
    >
      <svg className="curved-loop-svg" viewBox="0 0 1440 120">
        <text
          ref={measureRef}
          xmlSpace="preserve"
          style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}
        >
          {text}
        </text>
        <defs>
          <path
            ref={pathRef}
            id={pathId}
            d={pathD}
            fill="none"
            stroke="transparent"
          />
        </defs>
        {ready && (
          <text fontWeight="bold" xmlSpace="preserve" className={className}>
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              startOffset={`${offset}px`}
              xmlSpace="preserve"
            >
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
}
