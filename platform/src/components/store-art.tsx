type Placement = { x: number; y: number; s?: number; d?: number };

function ArtDefs() {
  return <defs>
    <radialGradient id="art-face" cx=".32" cy=".28" r=".95"><stop offset="0" stopColor="#fffbe0" /><stop offset=".22" stopColor="#ffe08a" /><stop offset=".6" stopColor="#d99a1c" /><stop offset="1" stopColor="#8a5a08" /></radialGradient>
    <radialGradient id="art-dish" cx=".6" cy=".7" r="1"><stop offset="0" stopColor="#ffe9a0" /><stop offset=".5" stopColor="#d9a021" /><stop offset="1" stopColor="#a8700e" /></radialGradient>
    <linearGradient id="art-edge" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#6e4208" /><stop offset=".28" stopColor="#f2c14a" /><stop offset=".5" stopColor="#fff0a8" /><stop offset=".78" stopColor="#c68a14" /><stop offset="1" stopColor="#5e3704" /></linearGradient>
    <linearGradient id="art-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2b0" /><stop offset=".35" stopColor="#e5a92a" /><stop offset=".7" stopColor="#a86d0c" /><stop offset="1" stopColor="#f0c75a" /></linearGradient>
    <linearGradient id="art-bag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b9854f" /><stop offset=".55" stopColor="#7a4a22" /><stop offset="1" stopColor="#3f2310" /></linearGradient>
    <linearGradient id="art-wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#9a5a2a" /><stop offset=".5" stopColor="#6d3a18" /><stop offset="1" stopColor="#3d1f0c" /></linearGradient>
    <radialGradient id="art-glow"><stop offset="0" stopColor="#fff0a8" stopOpacity=".95" /><stop offset="1" stopColor="#f59e0b" stopOpacity="0" /></radialGradient>
    <radialGradient id="art-halo"><stop offset="0" stopColor="#fbbf24" stopOpacity=".32" /><stop offset="1" stopColor="#fbbf24" stopOpacity="0" /></radialGradient>
    <radialGradient id="art-floor"><stop offset="0" stopColor="#9ad8ff" stopOpacity=".22" /><stop offset="1" stopColor="#9ad8ff" stopOpacity="0" /></radialGradient>
    <radialGradient id="sack-body" cx=".38" cy=".32" r=".85"><stop offset="0" stopColor="#d9a867" /><stop offset=".35" stopColor="#a8723a" /><stop offset=".75" stopColor="#6b4120" /><stop offset="1" stopColor="#35200d" /></radialGradient>
    <linearGradient id="sack-shade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".05" /><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".5" /></linearGradient>
    <linearGradient id="sack-neck" x1="0" x2="1"><stop offset="0" stopColor="#7d5028" /><stop offset=".4" stopColor="#c08a4e" /><stop offset="1" stopColor="#4a2c14" /></linearGradient>
    <linearGradient id="sack-rope" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f0dba8" /><stop offset="1" stopColor="#a88848" /></linearGradient>
    <pattern id="sack-weave" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 1.5H3" stroke="#2a1507" strokeOpacity=".22" strokeWidth=".7" /><path d="M1.5 0V3" stroke="#f5d9a0" strokeOpacity=".12" strokeWidth=".6" /></pattern>
    <pattern id="wood-grain" width="64" height="5" patternUnits="userSpaceOnUse"><path d="M0 1.2Q16 .2 32 1.4T64 1" fill="none" stroke="#2a1306" strokeOpacity=".35" strokeWidth=".7" /><path d="M0 3.6Q20 4.4 40 3.4T64 3.8" fill="none" stroke="#e0a468" strokeOpacity=".16" strokeWidth=".6" /></pattern>
  </defs>;
}

function Coin({ x, y, s = 1, rot = 0 }: Placement & { rot?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-11 0v3.4a11 4.2 0 0 0 22 0V0z" fill="url(#art-edge)" />
    <path d="M-10.6 2.3a10.6 4.1 0 0 0 21.2 0" fill="none" stroke="#4a2a02" strokeOpacity=".4" strokeWidth="2.6" strokeDasharray=".55 .75" />
    <ellipse rx="11" ry="4.2" fill="url(#art-face)" />
    <ellipse rx="10" ry="3.75" fill="none" stroke="#fff6c0" strokeOpacity=".85" strokeWidth=".6" />
    <ellipse rx="8" ry="2.95" fill="url(#art-dish)" stroke="#7a4a06" strokeOpacity=".55" strokeWidth=".5" />
    <path d="M-1.9-1.8h3.8v.8h-1.5v2.9h-.8v-2.9h-1.5z" fill="#6b3d03" fillOpacity=".9" />
    <path d="M-2.15-2.2h3.8v.8h-1.5v2.9h-.8v-2.9h-1.5z" fill="#fff3b0" fillOpacity=".75" />
    <path d="M-8.4-1.5Q-4-3.9 1-3.6" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth=".8" strokeLinecap="round" />
  </g>;
}

function Heap({ x, y, rows, s = 1 }: Placement & { rows: number }) {
  const coins: Array<{ cx: number; cy: number; rot: number }> = [];
  for (let r = rows - 1; r >= 0; r--) {
    const count = rows - r;
    for (let i = 0; i < count; i++) coins.push({ cx: (i - (count - 1) / 2) * 19 * s + ((i * 7 + r * 3) % 5 - 2) * .5, cy: -r * 5.2 * s, rot: ((i * 5 + r * 7) % 9) - 4 });
  }
  return <g transform={`translate(${x} ${y})`}>{coins.map((c, i) => <Coin key={i} x={c.cx} y={c.cy} s={s} rot={c.rot} />)}</g>;
}

function Bag({ x, y, s = 1, d = 0 }: Placement) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g className="bag-sway" style={{ animationDelay: `${d}s` }}>
      <ellipse cx="0" cy="1" rx="30" ry="5" fill="#000" opacity=".4" />
      <path d="M-9-40C-12-32-30-26-35-10-38 0-28 5 0 5S38 0 35-10C30-26 12-32 9-40Z" fill="url(#sack-body)" stroke="#2a1507" strokeWidth="1" strokeLinejoin="round" />
      <path d="M-9-40C-12-32-30-26-35-10-38 0-28 5 0 5S38 0 35-10C30-26 12-32 9-40Z" fill="url(#sack-weave)" />
      <path d="M-9-40C-12-32-30-26-35-10-38 0-28 5 0 5S38 0 35-10C30-26 12-32 9-40Z" fill="url(#sack-shade)" />
      <path d="M-24-24C-30-16-31-6-26 0" fill="none" stroke="#ffe7b8" strokeOpacity=".32" strokeWidth="4" strokeLinecap="round" />
      <path d="M-6-34C-10-24-8-12-12 0M7-34C10-22 9-10 13-1" fill="none" stroke="#2a1507" strokeOpacity=".3" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M-4-12C-2-6-2-2 0 3" fill="none" stroke="#2a1507" strokeOpacity=".22" strokeWidth="1" />
      <path d="M-11-50C-15-42-17-40-9-38L9-38C17-40 15-42 11-50 6-46 3-47 0-45-3-47-6-46-11-50Z" fill="url(#sack-neck)" stroke="#2a1507" strokeWidth=".9" strokeLinejoin="round" />
      <path d="M-6-47L-5-39M0-45V-38M6-47L5-39" stroke="#2a1507" strokeOpacity=".4" strokeWidth=".8" />
      <Coin x={-5} y={-51} s={.55} rot={-18} /><Coin x={5} y={-52} s={.55} rot={14} />
      <path d="M-11-38Q0-33 11-38" fill="none" stroke="url(#sack-rope)" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M-11-38Q0-33 11-38" fill="none" stroke="#6b4e1c" strokeOpacity=".6" strokeWidth="3.6" strokeLinecap="round" strokeDasharray=".9 1.5" />
      <path d="M0-35C-6-28-9-24-7-19M0-35C5-27 9-24 8-18" fill="none" stroke="url(#sack-rope)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="0" cy="-35" r="2.4" fill="#d6b56c" stroke="#6b4e1c" strokeWidth=".6" />
      <circle cx="0" cy="-12" r="12.5" fill="#3a2410" opacity=".5" />
      <circle cx="0" cy="-13" r="11.2" fill="url(#art-edge)" stroke="#5e3704" strokeWidth=".6" />
      <circle cx="0" cy="-13" r="10.4" fill="none" stroke="#3b2204" strokeOpacity=".4" strokeWidth="1.6" strokeDasharray=".6 .8" />
      <circle cx="0" cy="-13" r="8.8" fill="url(#art-face)" stroke="#fff1b0" strokeOpacity=".8" strokeWidth=".6" />
      <path d="M-3.6-17.2h7.2v1.8h-2.7v7.4h-1.8v-7.4h-2.7z" fill="#6b3d03" fillOpacity=".9" />
      <path d="M-3.9-17.6h7.2v1.8h-2.7v7.4h-1.8v-7.4h-2.7z" fill="#fff3b0" fillOpacity=".7" />
      <path d="M-6-18Q-2-21 3-20" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth=".9" strokeLinecap="round" />
      <path d="M-27-2Q0 6 27-2" fill="none" stroke="#f1d49b" strokeOpacity=".45" strokeWidth=".9" strokeDasharray="2 2" />
    </g>
  </g>;
}

function Chest({ x, y, s = 1, d = 0, heap = 3 }: Placement & { heap?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g className="bag-sway" style={{ animationDelay: `${d}s` }}>
      <path d="M-30-26L-26-54Q0-62 26-54L30-26Z" fill="#1d0d04" stroke="#2c1608" strokeWidth="1.1" />
      <path d="M-26-54Q0-62 26-54" fill="none" stroke="url(#art-metal)" strokeWidth="4.2" strokeLinecap="round" />
      <ellipse className="chest-glow" cx="0" cy="-30" rx="36" ry="17" fill="url(#art-glow)" />
      <Heap x={0} y={-25} rows={heap} s={.95} />
      <rect x="-32" y="-26" width="64" height="30" rx="3" fill="url(#art-wood)" stroke="#2c1608" strokeWidth="1.1" />
      <rect x="-32" y="-26" width="64" height="30" rx="3" fill="url(#wood-grain)" />
      <path d="M-32-16H32M-32-6H32" stroke="#1d0d04" strokeOpacity=".55" strokeWidth=".9" />
      <g><rect x="-32" y="-26" width="64" height="4.5" rx="2" fill="url(#art-metal)" />
        <rect x="-26" y="-26" width="7.5" height="30" fill="url(#art-metal)" /><rect x="18.5" y="-26" width="7.5" height="30" fill="url(#art-metal)" />
        <rect x="-8" y="-21" width="16" height="17" rx="3" fill="url(#art-metal)" stroke="#6e4208" strokeWidth=".9" />
      </g>
      {[-22.2, 22.2].flatMap((bx) => [-20, -2].map((by) => <circle key={`${bx}${by}`} cx={bx} cy={by} r="1.3" fill="#fff0a8" stroke="#6e4208" strokeWidth=".5" />))}
      <circle cx="0" cy="-14" r="2.3" fill="#2a1304" /><path d="M0-14v5.5" stroke="#2a1304" strokeWidth="1.7" strokeLinecap="round" />
    </g>
  </g>;
}

export function CoinStack({ tier }: { tier: number }) {
  const lift = Math.max(0, tier);
  return <svg className="store-coins" viewBox="0 0 160 120" aria-hidden="true">
    <ArtDefs />
    <ellipse className="art-halo" cx="80" cy="66" rx={44 + lift * 5} ry={34 + lift * 3} fill="url(#art-halo)" />
    <ellipse cx="80" cy="108" rx={46 + lift * 4} ry="9" fill="url(#art-floor)" />
    <ellipse cx="80" cy="108" rx={34 + lift * 4} ry="5" fill="#000" opacity=".5" />
    {tier === -2 && <Coin x={80} y={98} s={1.75} rot={-6} />}
    {tier === -1 && <Heap x={80} y={102} rows={2} s={1.3} />}
    {tier === 0 && <Heap x={80} y={102} rows={3} s={1.05} />}
    {tier === 1 && <><Bag x={80} y={102} s={.8} /><Coin x={50} y={106} s={.95} rot={-8} /><Coin x={112} y={106} s={.95} rot={6} /></>}
    {tier === 2 && <><Bag x={80} y={102} s={1.05} /><Heap x={42} y={107} rows={2} s={.8} /><Coin x={118} y={107} rot={5} /></>}
    {tier === 3 && <><Bag x={62} y={102} s={1} /><Bag x={102} y={102} s={.85} d={.4} /><Heap x={80} y={108} rows={2} s={.85} /></>}
    {tier === 4 && <Chest x={80} y={104} s={1.3} heap={3} />}
    {tier === 5 && <><Chest x={74} y={104} s={1.25} heap={4} /><Bag x={126} y={106} s={.75} d={.4} /><Bag x={26} y={106} s={.62} d={.7} /></>}
    {tier >= 6 && <><Chest x={40} y={106} s={.85} heap={3} d={.2} /><Chest x={120} y={106} s={.85} heap={3} d={.6} /><Chest x={80} y={98} s={1.2} heap={5} /><Bag x={80} y={110} s={.5} d={.9} /></>}
    <path className="coin-spark s1" d="M140 16l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff3c4" />
    <path className="coin-spark s2" d="M20 28l1.5 4.5 4.5 1.5-4.5 1.5L20 40l-1.5-4.5L14 34l4.5-1.5z" fill="#fde68a" />
    <path className="coin-spark s3" d="M124 44l1.2 3.4 3.4 1.2-3.4 1.2-1.2 3.4-1.2-3.4-3.4-1.2 3.4-1.2z" fill="#fff" />
  </svg>;
}

const metals = {
  basic: { hi: "#ffd9b0", mid: "#c7773a", lo: "#5b2d0f", edgeHi: "#f6b27a", ribbonA: "#7a1f1f", ribbonB: "#4a1010", glow: "#e0862f", ink: "#3a1a08" },
  standard: { hi: "#ffffff", mid: "#b9c7d6", lo: "#566474", edgeHi: "#e8f0f8", ribbonA: "#1f4f8f", ribbonB: "#0f2c57", glow: "#7fc0ff", ink: "#26323f" },
  expert: { hi: "#fff6c2", mid: "#e0a82c", lo: "#7a4a06", edgeHi: "#ffe27a", ribbonA: "#5b2a9e", ribbonB: "#32115f", glow: "#c084fc", ink: "#4a2c02" }
} as const;

export function PlanArt({ plan }: { plan: "basic" | "standard" | "expert" }) {
  const m = metals[plan];
  const id = `pm-${plan}`;
  return <svg className="store-coins plan-art" viewBox="0 0 160 120" aria-hidden="true">
    <ArtDefs />
    <defs>
      <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={m.hi} /><stop offset=".45" stopColor={m.mid} /><stop offset=".55" stopColor={m.edgeHi} /><stop offset="1" stopColor={m.lo} /></linearGradient>
      <radialGradient id={`${id}-dish`} cx=".35" cy=".3" r=".95"><stop offset="0" stopColor={m.hi} /><stop offset=".5" stopColor={m.mid} /><stop offset="1" stopColor={m.lo} /></radialGradient>
      <linearGradient id={`${id}-rib`} x1="0" x2="1"><stop offset="0" stopColor={m.ribbonB} /><stop offset=".5" stopColor={m.ribbonA} /><stop offset="1" stopColor={m.ribbonB} /></linearGradient>
      <radialGradient id={`${id}-g`}><stop offset="0" stopColor={m.glow} stopOpacity=".5" /><stop offset="1" stopColor={m.glow} stopOpacity="0" /></radialGradient>
      <clipPath id={`${id}-clip`}><circle cx="80" cy="50" r="38" /></clipPath>
      <linearGradient id={`${id}-glint`} x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".7" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
    </defs>
    <ellipse className="art-halo" cx="80" cy="56" rx="64" ry="52" fill={`url(#${id}-g)`} />
    <ellipse cx="80" cy="112" rx="40" ry="5" fill="#000" opacity=".5" />
    <g className="plan-float">
      <path d="M60 78L48 112L62 106L68 116L82 84Z" fill={`url(#${id}-rib)`} />
      <path d="M100 78L112 112L98 106L92 116L78 84Z" fill={`url(#${id}-rib)`} />
      <g>
        <circle cx="80" cy="50" r="42" fill={`url(#${id}-rim)`} stroke={m.lo} strokeWidth="1" />
        <circle cx="80" cy="50" r="38" fill="none" stroke={m.lo} strokeOpacity=".55" strokeWidth="3.4" strokeDasharray=".9 1.3" />
        <circle cx="80" cy="50" r="33.5" fill={`url(#${id}-dish)`} stroke={m.hi} strokeOpacity=".8" strokeWidth="1" />
      </g>
      <circle cx="80" cy="50" r="29.5" fill="none" stroke={m.lo} strokeOpacity=".5" strokeWidth=".8" />
      <g>
        {plan === "basic" && <g fill={m.ink} fillOpacity=".92" stroke={m.hi} strokeOpacity=".6" strokeWidth=".6">
          <circle cx="80" cy="40" r="9.5" /><circle cx="80" cy="40" r="4.2" fill={m.mid} />
          <rect x="77.2" y="48" width="5.6" height="22" rx="1.2" /><rect x="82.8" y="57" width="7" height="3.8" rx="1" /><rect x="82.8" y="64" width="5.2" height="3.8" rx="1" />
        </g>}
        {plan === "standard" && <path d="M80 26l6.7 14 15.2 2.1-11 10.8 2.6 15.3L80 60.7 66.5 68.2l2.6-15.3-11-10.8L73.3 40z" fill={m.ink} fillOpacity=".9" stroke={m.hi} strokeOpacity=".7" strokeWidth=".7" strokeLinejoin="round" />}
        {plan === "expert" && <g stroke={m.hi} strokeOpacity=".7" strokeWidth=".6" strokeLinejoin="round">
          <path d="M60 62l5-24 11 11 4-15 4 15 11-11 5 24z" fill={m.ink} fillOpacity=".92" />
          <rect x="60" y="62" width="40" height="7" rx="1.5" fill={m.ink} />
          <circle cx="80" cy="47" r="2.6" fill="#e9b6ff" /><circle cx="68" cy="52" r="1.8" fill="#8fd2ff" /><circle cx="92" cy="52" r="1.8" fill="#8fd2ff" />
        </g>}
      </g>
      <g clipPath={`url(#${id}-clip)`}><rect className="plan-glint" x="-10" y="0" width="34" height="110" fill={`url(#${id}-glint)`} transform="skewX(-18)" /></g>
    </g>
    <path className="coin-spark s1" d="M138 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff" />
    <path className="coin-spark s2" d="M20 34l1.5 4.5 4.5 1.5-4.5 1.5L20 46l-1.5-4.5L14 40l4.5-1.5z" fill="#fff" />
    {plan === "expert" && <path className="coin-spark s3" d="M128 78l1.2 3.4 3.4 1.2-3.4 1.2-1.2 3.4-1.2-3.4-3.4-1.2 3.4-1.2z" fill="#fff" />}
  </svg>;
}
