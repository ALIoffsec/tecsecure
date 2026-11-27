/**
 * The one XP scale for learning: levels, the weekly goal and its streak, and skill scores. Pure, so it is
 * tested alone. XP itself comes from lessons, modules, labs and exams (lib/learning-profile.ts); buying TEC
 * gives none.
 */

/** XP needed to reach level L (level 1 starts at 0): 100·(L−1) + 25·(L−1)², rounded. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  const step = level - 1;
  return Math.round(100 * step + 25 * step * step);
}

export const LEVEL_NAMES = {
  uz: ["Yangi", "Shogird", "Amaliyotchi", "Mutaxassis", "Ekspert"],
  ru: ["Новичок", "Ученик", "Практик", "Специалист", "Эксперт"],
  en: ["Newcomer", "Apprentice", "Practitioner", "Specialist", "Expert"]
} as const;

export type LevelInfo = { level: number; nameIndex: number; stage: number; floor: number; ceil: number; toNext: number; percent: number };

/** The level for an amount of XP: each name has three stages; past the last name the stages keep its name. */
export function levelForXp(xp: number): LevelInfo {
  const safe = Math.max(0, Math.floor(xp));
  let level = 1;
  while (xpForLevel(level + 1) <= safe) level += 1;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const nameIndex = Math.min(LEVEL_NAMES.uz.length - 1, Math.floor((level - 1) / 3));
  const stage = nameIndex === LEVEL_NAMES.uz.length - 1 && level > LEVEL_NAMES.uz.length * 3 ? 3 : ((level - 1) % 3) + 1;
  return { level, nameIndex, stage, floor, ceil, toNext: ceil - safe, percent: Math.round(((safe - floor) / (ceil - floor)) * 100) };
}

export const WEEKLY_GOAL_XP = 200;
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Monday 00:00 in Tashkent (UTC+5, no daylight saving) of the week holding this moment, as a UTC instant. */
export function weekStart(at: Date | string | number): Date {
  const local = new Date(new Date(at).getTime() + TASHKENT_OFFSET_MS);
  const day = local.getUTCDay();
  const sinceMonday = (day + 6) % 7;
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - sinceMonday * DAY_MS;
  return new Date(midnight - TASHKENT_OFFSET_MS);
}

export type XpEvent = { at: Date | string; xp: number };

/** XP per week for the last `weeks` weeks, oldest first; the last entry is the current week. */
export function weeklyXp(events: XpEvent[], now: Date = new Date(), weeks = 12): { start: Date; xp: number }[] {
  const current = weekStart(now).getTime();
  const buckets = Array.from({ length: weeks }, (_, index) => ({ start: new Date(current - (weeks - 1 - index) * 7 * DAY_MS), xp: 0 }));
  const first = buckets[0].start.getTime();
  for (const event of events) {
    const start = weekStart(event.at).getTime();
    if (start < first || start > current) continue;
    buckets[Math.round((start - first) / (7 * DAY_MS))].xp += event.xp;
  }
  return buckets;
}

/**
 * Weeks in a row that reached the goal, counted back from the newest. The current week counts once it is
 * reached; while it is still under way it does not break the streak.
 */
export function streakWeeks(weekly: { xp: number }[], goal = WEEKLY_GOAL_XP): number {
  let index = weekly.length - 1;
  if (index >= 0 && weekly[index].xp < goal) index -= 1;
  let streak = 0;
  for (; index >= 0 && weekly[index].xp >= goal; index -= 1) streak += 1;
  return streak;
}

/** A skill's score 0–100: the XP earned in it over the XP it can give. Nothing to earn means 0. */
export function skillScore(earned: number, possible: number): number {
  if (possible <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((earned / possible) * 100)));
}
