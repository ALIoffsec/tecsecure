"use client";

/**
 * A small bar chart shared by the cabinet (activity over 12 months) and learning (XP over 12 weeks). Each bar
 * is focusable and names its period and value, so hover, keyboard and screen readers all get the number.
 * Bars do not animate when motion is reduced (CSS).
 */
export function ActivityBars({ bars, label, unit = "" }: { bars: { key: string; short: string; long: string; value: number }[]; label: string; unit?: string }) {
  const max = Math.max(1, ...bars.map(bar => bar.value));
  return <ol className="activity-bars" aria-label={label}>
    {bars.map(bar => {
      const text = `${bar.long}: ${bar.value}${unit ? ` ${unit}` : ""}`;
      return <li key={bar.key} tabIndex={0} aria-label={text} data-tip={text}>
        <span className="activity-bar" style={{ height: `${Math.max(bar.value ? 6 : 2, Math.round((bar.value / max) * 100))}%` }} data-empty={bar.value === 0 || undefined} aria-hidden="true" />
        <span className="activity-label" aria-hidden="true">{bar.short}</span>
      </li>;
    })}
  </ol>;
}
