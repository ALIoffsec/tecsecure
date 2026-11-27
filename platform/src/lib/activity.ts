/** Counting things per month for the activity chart, in Tashkent time (UTC+5). Pure, so it is tested alone. */
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

const monthIndex = (at: Date | string | number) => {
  const local = new Date(new Date(at).getTime() + TASHKENT_OFFSET_MS);
  return local.getUTCFullYear() * 12 + local.getUTCMonth();
};

/** How many dates fall in each of the last `months` months, oldest first; the last entry is this month. */
export function monthlyCounts(dates: (Date | string)[], now: Date = new Date(), months = 12): { year: number; month: number; count: number }[] {
  const current = monthIndex(now);
  const buckets = Array.from({ length: months }, (_, index) => {
    const value = current - (months - 1 - index);
    return { year: Math.floor(value / 12), month: value % 12, count: 0 };
  });
  for (const date of dates) {
    const offset = monthIndex(date) - (current - (months - 1));
    if (offset >= 0 && offset < months) buckets[offset].count += 1;
  }
  return buckets;
}

export const MONTH_SHORT = {
  uz: ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"],
  ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
} as const;
