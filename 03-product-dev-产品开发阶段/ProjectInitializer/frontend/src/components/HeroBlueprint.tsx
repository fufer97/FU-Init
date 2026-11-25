import React from 'react';

/**
 * Conceptual isometric "workspace skeleton" illustration, drawn as pure SVG.
 * Floating stage slabs (02 design / 03 dev) rise from a blueprint floor, with a
 * dashed wireframe block on top representing the part the Agent builds next.
 * Vector-only: crisp on every screen, no image weight, scales for mobile.
 */

const S = 36;
const C = Math.cos(Math.PI / 6);
const ACCENT = '#2563EB';

type P3 = [number, number, number];

const iso = ([x, y, z]: P3): [number, number] => [(x - y) * C * S, (x + y) * 0.5 * S - z * S];

const pts = (ps: P3[]) =>
  ps
    .map((p) => {
      const [sx, sy] = iso(p);
      return `${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(' ');

const seg = (a: P3, b: P3) => {
  const [x1, y1] = iso(a);
  const [x2, y2] = iso(b);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
};

interface BoxSpec {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
}

type BoxVariant = 'solid' | 'glass' | 'wire';

const Box: React.FC<BoxSpec & { variant?: BoxVariant; accentTop?: boolean }> = ({
  x,
  y,
  z,
  w,
  d,
  h,
  variant = 'solid',
  accentTop = false,
}) => {
  const z1 = z + h;
  const top = pts([
    [x, y, z1],
    [x + w, y, z1],
    [x + w, y + d, z1],
    [x, y + d, z1],
  ]);
  const right = pts([
    [x + w, y, z1],
    [x + w, y + d, z1],
    [x + w, y + d, z],
    [x + w, y, z],
  ]);
  const left = pts([
    [x, y + d, z1],
    [x + w, y + d, z1],
    [x + w, y + d, z],
    [x, y + d, z],
  ]);

  if (variant === 'wire') {
    const c: Record<string, P3> = {
      a0: [x, y, z],
      b0: [x + w, y, z],
      c0: [x + w, y + d, z],
      d0: [x, y + d, z],
      a1: [x, y, z1],
      b1: [x + w, y, z1],
      c1: [x + w, y + d, z1],
      d1: [x, y + d, z1],
    };
    const edges = [
      seg(c.a0, c.b0),
      seg(c.b0, c.c0),
      seg(c.c0, c.d0),
      seg(c.d0, c.a0),
      seg(c.a1, c.b1),
      seg(c.b1, c.c1),
      seg(c.c1, c.d1),
      seg(c.d1, c.a1),
      seg(c.a0, c.a1),
      seg(c.b0, c.b1),
      seg(c.c0, c.c1),
      seg(c.d0, c.d1),
    ].join('');
    return (
      <g>
        <polygon points={top} fill={ACCENT} fillOpacity={0.07} />
        <path
          d={edges}
          fill="none"
          stroke={ACCENT}
          strokeOpacity={0.75}
          strokeWidth={1.25}
          strokeDasharray="5 5"
          className="bp-march"
        />
      </g>
    );
  }

  const glass = variant === 'glass';
  const stroke = glass ? 'rgba(37,99,235,0.28)' : 'rgba(9,9,11,0.10)';
  const frontTopEdge = pts([
    [x + w, y, z1],
    [x + w, y + d, z1],
    [x, y + d, z1],
  ]);

  return (
    <g strokeLinejoin="round">
      <polygon
        points={left}
        fill={glass ? 'rgba(226,232,244,0.78)' : '#E4E7EC'}
        stroke={stroke}
        strokeWidth={1}
      />
      <polygon
        points={right}
        fill={glass ? 'rgba(238,242,250,0.78)' : '#EFF1F4'}
        stroke={stroke}
        strokeWidth={1}
      />
      <polygon
        points={top}
        fill={glass ? 'rgba(255,255,255,0.86)' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={1}
      />
      {accentTop && (
        <polyline
          points={frontTopEdge}
          fill="none"
          stroke={ACCENT}
          strokeOpacity={0.85}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

/** Dashed vertical guides from the 4 corners of an upper slab down to the slab below. */
const Guides: React.FC<{ spec: BoxSpec; toZ: number }> = ({ spec, toZ }) => {
  const { x, y, z, w, d } = spec;
  const corners: Array<[number, number]> = [
    [x, y],
    [x + w, y],
    [x + w, y + d],
    [x, y + d],
  ];
  const path = corners.map(([cx, cy]) => seg([cx, cy, toZ], [cx, cy, z])).join('');
  return (
    <g>
      <path
        d={path}
        stroke={ACCENT}
        strokeOpacity={0.35}
        strokeWidth={1}
        strokeDasharray="2 4"
        fill="none"
      />
      {corners.slice(1, 4).map(([cx, cy]) => {
        const [sx, sy] = iso([cx, cy, toZ]);
        return <circle key={`${cx}-${cy}`} cx={sx} cy={sy} r={2.2} fill={ACCENT} fillOpacity={0.7} />;
      })}
    </g>
  );
};

const Label: React.FC<{ anchor: P3; side: 'left' | 'right'; text: string; to: number }> = ({
  anchor,
  side,
  text,
  to,
}) => {
  const [ax, ay] = iso(anchor);
  const tx = side === 'right' ? to : -to;
  return (
    <g>
      <circle cx={ax} cy={ay} r={2.8} fill={ACCENT} />
      <path d={`M${ax} ${ay}H${tx}`} stroke="rgba(9,9,11,0.22)" strokeWidth={1} />
      <text
        x={side === 'right' ? tx + 8 : tx - 8}
        y={ay + 4}
        textAnchor={side === 'right' ? 'start' : 'end'}
        className="font-mono"
        fontSize={12.5}
        fill="#52525B"
      >
        {text}
      </text>
    </g>
  );
};

const BASE: BoxSpec = { x: 0, y: 0, z: 0, w: 10, d: 10, h: 0.35 };
const LAYER_02: BoxSpec = { x: 2, y: 2, z: 1.7, w: 6, d: 6, h: 0.35 };
const LAYER_03: BoxSpec = { x: 3, y: 3, z: 3.1, w: 4, d: 4, h: 0.35 };
const LAYER_NEXT: BoxSpec = { x: 4, y: 4, z: 4.5, w: 2, d: 2, h: 1.1 };

type ModuleSpec = BoxSpec & { variant?: BoxVariant };

const MODULES: ModuleSpec[] = ([
  { x: 0.5, y: 0.5, z: 0.35, w: 1, d: 1, h: 1.1 },
  { x: 1.9, y: 0.5, z: 0.35, w: 1, d: 1, h: 0.7 },
  { x: 0.5, y: 1.9, z: 0.35, w: 1, d: 1, h: 0.5 },
  { x: 8.5, y: 0.5, z: 0.35, w: 1, d: 1, h: 0.8 },
  { x: 8.5, y: 1.9, z: 0.35, w: 1, d: 1, h: 0.45, variant: 'wire' },
  { x: 0.5, y: 8.5, z: 0.35, w: 1, d: 1, h: 0.6 },
  { x: 1.9, y: 8.5, z: 0.35, w: 1, d: 1, h: 0.9, variant: 'wire' },
  { x: 7.1, y: 8.5, z: 0.35, w: 1, d: 1, h: 0.4 },
  { x: 8.5, y: 7.1, z: 0.35, w: 1, d: 1, h: 0.55 },
  { x: 8.5, y: 8.5, z: 0.35, w: 1, d: 1, h: 0.75 },
] as ModuleSpec[]).sort((a, b) => a.x + a.y - (b.x + b.y));

const GRID_MIN = -3;
const GRID_MAX = 13;

export const HeroBlueprint: React.FC<{ className?: string }> = ({ className }) => {
  const gridLines: string[] = [];
  for (let i = GRID_MIN; i <= GRID_MAX; i += 1) {
    gridLines.push(seg([i, GRID_MIN, 0], [i, GRID_MAX, 0]));
    gridLines.push(seg([GRID_MIN, i, 0], [GRID_MAX, i, 0]));
  }
  const [gcx, gcy] = iso([5, 5, 0]);

  const boundary = pts([
    [-1.2, -1.2, 0],
    [11.2, -1.2, 0],
    [11.2, 11.2, 0],
    [-1.2, 11.2, 0],
  ]);
  const shadow = pts([
    [-0.4, -0.4, 0],
    [10.6, -0.4, 0],
    [10.6, 10.6, 0],
    [-0.4, 10.6, 0],
  ]);

  return (
    <svg
      viewBox="-500 -120 1000 560"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <radialGradient id="bp-grid-fade" cx={gcx} cy={gcy} r={430} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity={1} />
          <stop offset="70%" stopColor="#fff" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id="bp-grid-mask">
          <rect x={-500} y={-120} width={1000} height={560} fill="url(#bp-grid-fade)" />
        </mask>
        <filter id="bp-soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={16} />
        </filter>
      </defs>

      {/* Blueprint floor */}
      <g className="bp-rise" style={{ animationDelay: '0ms' }}>
        <path d={gridLines.join('')} stroke="rgba(9,9,11,0.07)" strokeWidth={1} mask="url(#bp-grid-mask)" />
        <polygon
          points={boundary}
          fill="none"
          stroke={ACCENT}
          strokeOpacity={0.28}
          strokeWidth={1}
          strokeDasharray="6 6"
        />
        <polygon
          points={shadow}
          fill={ACCENT}
          fillOpacity={0.1}
          filter="url(#bp-soft-shadow)"
          transform="translate(0 14)"
        />
      </g>

      {/* Base platform + folder modules */}
      <g className="bp-rise" style={{ animationDelay: '120ms' }}>
        <Box {...BASE} />
        {MODULES.map((m) => (
          <Box key={`${m.x}-${m.y}`} {...m} />
        ))}
      </g>

      {/* 02 Design slab */}
      <g className="bp-rise" style={{ animationDelay: '280ms' }}>
        <Guides spec={LAYER_02} toZ={BASE.z + BASE.h} />
        <Box {...LAYER_02} accentTop />
      </g>

      {/* 03 Dev slab */}
      <g className="bp-rise" style={{ animationDelay: '440ms' }}>
        <Guides spec={LAYER_03} toZ={LAYER_02.z + LAYER_02.h} />
        <Box {...LAYER_03} variant="glass" accentTop />
      </g>

      {/* Next block the Agent builds: dashed wireframe, gently floating */}
      <g className="bp-rise" style={{ animationDelay: '600ms' }}>
        <g className="bp-float">
          <Guides spec={LAYER_NEXT} toZ={LAYER_03.z + LAYER_03.h} />
          <Box {...LAYER_NEXT} variant="wire" />
        </g>
      </g>

      {/* Annotations (desktop only) */}
      <g className="bp-rise hidden sm:inline" style={{ animationDelay: '820ms' }}>
        <Label anchor={[8, 2, LAYER_02.z + LAYER_02.h]} side="right" text="02 · 产品设计" to={320} />
        <Label anchor={[7, 3, LAYER_03.z + LAYER_03.h]} side="right" text="03 · 产品开发" to={320} />
        <Label anchor={[6, 4, LAYER_NEXT.z + LAYER_NEXT.h]} side="right" text="build-fde-project" to={320} />
        <Label anchor={[2, 8, LAYER_02.z + LAYER_02.h]} side="left" text="AGENTS.md" to={320} />
        <Label anchor={[3, 7, LAYER_03.z + LAYER_03.h]} side="left" text=".agents/skills" to={320} />
      </g>
    </svg>
  );
};
