export const ANALYTICS_COOKIE = "tecsecure-analytics";

type Metrika = (id: number, action: string, ...rest: unknown[]) => void;

/** Counts a step that matters, if the visitor allowed statistics and a counter is configured. */
export function trackGoal(goal: string) {
  const id = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);
  const counter = (window as unknown as { ym?: Metrika }).ym;
  if (id && counter) counter(id, "reachGoal", goal);
}
