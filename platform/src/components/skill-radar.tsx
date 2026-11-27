/**
 * A spider chart of skills, drawn as plain SVG: three rings of web, the filled shape on top, and each axis
 * named with its score. Screen readers get a title, a description and the same numbers as a list.
 */
export function SkillRadar({ axes, title, description }: { axes: { label: string; score: number }[]; title: string; description: string }) {
  const size = 300;
  const center = size / 2;
  const radius = 96;
  const point = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    return [center + Math.cos(angle) * radius * value, center + Math.sin(angle) * radius * value] as const;
  };
  const ring = (value: number) => axes.map((_, index) => point(index, value).join(",")).join(" ");
  const shape = axes.map((axis, index) => point(index, Math.max(0.02, axis.score / 100)).join(",")).join(" ");
  return <figure className="learn-radar">
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-labelledby="radar-title radar-desc">
      <title id="radar-title">{title}</title>
      <desc id="radar-desc">{description}</desc>
      {[1 / 3, 2 / 3, 1].map(value => <polygon key={value} className="learn-radar-ring" points={ring(value)} />)}
      {axes.map((_, index) => { const [x, y] = point(index, 1); return <line key={index} className="learn-radar-spoke" x1={center} y1={center} x2={x} y2={y} />; })}
      <polygon className="learn-radar-shape" points={shape} style={{ transformOrigin: `${center}px ${center}px` }} />
      {axes.map((axis, index) => {
        const [x, y] = point(index, 1.24);
        const anchor = Math.abs(x - center) < 8 ? "middle" : x > center ? "start" : "end";
        return <text key={axis.label} className="learn-radar-label" x={x} y={y} textAnchor={anchor} dominantBaseline="middle">
          <tspan>{axis.label}</tspan><tspan className="learn-radar-score" dx="4">{axis.score}</tspan>
        </text>;
      })}
    </svg>
    <ul className="sr-only">{axes.map(axis => <li key={axis.label}>{axis.label}: {axis.score}</li>)}</ul>
  </figure>;
}
