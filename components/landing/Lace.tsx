/**
 * Renda Ñandutí — assinatura visual paraguaia.
 * Coordenadas arredondadas (3 decimais) para evitar hydration mismatch
 * entre SSR e CSR (SVG float precision difere entre Node e V8).
 */
import type { CSSProperties } from 'react';

interface LaceProps {
  size?: number;
  rays?: number;
  rings?: number;
  stroke?: string;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
  spinSec?: number;
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;

export default function Lace({
  size = 480,
  rays = 16,
  rings = 5,
  stroke = 'currentColor',
  opacity = 0.18,
  className,
  style,
  spinSec = 0,
}: LaceProps) {
  const r0 = 6;
  const rN = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  const ringRadii = Array.from({ length: rings }, (_, i) =>
    r3(r0 + ((rN - r0) * (i + 1)) / rings),
  );

  const rayLines = Array.from({ length: rays }, (_, i) => {
    const a = (i * Math.PI * 2) / rays;
    return {
      x1: r3(cx + Math.cos(a) * r0),
      y1: r3(cy + Math.sin(a) * r0),
      x2: r3(cx + Math.cos(a) * rN),
      y2: r3(cy + Math.sin(a) * rN),
    };
  });

  const nodes: Array<{ cx: number; cy: number; r: number }> = [];
  ringRadii.slice(0, rings - 1).forEach((rr, idx) => {
    for (let i = 0; i < rays; i += 2) {
      const a = (i * Math.PI * 2) / rays + (idx % 2 === 0 ? 0 : Math.PI / rays);
      nodes.push({
        cx: r3(cx + Math.cos(a) * rr),
        cy: r3(cy + Math.sin(a) * rr),
        r: 1.2,
      });
    }
  });

  const filigree = Array.from({ length: rays }, (_, i) => {
    const a1 = (i * Math.PI * 2) / rays;
    const a2 = ((i + 1) * Math.PI * 2) / rays;
    const r1 = ringRadii[1] ?? rN * 0.4;
    const r2 = ringRadii[Math.min(2, rings - 1)] ?? rN * 0.7;
    return {
      x1: r3(cx + Math.cos(a1) * r1),
      y1: r3(cy + Math.sin(a1) * r1),
      x2: r3(cx + Math.cos(a2) * r2),
      y2: r3(cy + Math.sin(a2) * r2),
    };
  });

  const containerStyle: CSSProperties = {
    color: stroke,
    opacity,
    ...style,
    ...(spinSec > 0 ? { animation: `nd-lace-spin ${spinSec}s linear infinite`, willChange: 'transform' } : {}),
  };

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={containerStyle}
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth={0.7}>
        <circle cx={cx} cy={cy} r={r0} />
        <circle cx={cx} cy={cy} r={r3(r0 / 2)} />
        {ringRadii.map((rr, i) => (
          <circle key={`r${i}`} cx={cx} cy={cy} r={rr} strokeWidth={i === ringRadii.length - 1 ? 0.5 : 0.7} />
        ))}
        {rayLines.map((l, i) => (
          <line key={`l${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
        ))}
        {filigree.map((l, i) => (
          <line key={`d${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth={0.4} />
        ))}
      </g>
      <g fill="currentColor">
        {nodes.map((n, i) => (
          <circle key={`n${i}`} cx={n.cx} cy={n.cy} r={n.r} />
        ))}
      </g>
      <style>{`@keyframes nd-lace-spin { to { transform: rotate(360deg); transform-origin: center; } }`}</style>
    </svg>
  );
}
