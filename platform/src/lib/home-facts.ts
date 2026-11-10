import { z } from "zod";
import type { Locale } from "./messages";

/**
 * Numbers the home and services pages may show: only what staff typed in the admin panel. An empty value
 * hides its line or block, so the site never shows a figure nobody gave us.
 */
export const mainServiceIds = ["cctv", "network", "audit", "support"] as const;
export type MainServiceId = (typeof mainServiceIds)[number];

const fact = z.string().trim().max(40).default("");
const serviceFacts = z.object({ from: fact, duration: fact, warranty: fact }).strict();
export const homeFactsSchema = z.object({
  trust: z.object({ projects: fact, years: fact, clients: fact, warranty: fact }).strict(),
  services: z.object({ cctv: serviceFacts, network: serviceFacts, audit: serviceFacts, support: serviceFacts }).strict()
}).strict();
export type HomeFacts = z.infer<typeof homeFactsSchema>;
export const HOME_FACTS_KEY = "homeFacts";

export const emptyHomeFacts: HomeFacts = homeFactsSchema.parse({
  trust: {},
  services: { cctv: {}, network: {}, audit: {}, support: {} }
});

/** Whatever is stored, as a full and valid object; anything unreadable counts as empty. */
export function parseHomeFacts(raw: string | null | undefined): HomeFacts {
  if (!raw) return emptyHomeFacts;
  try {
    const value = JSON.parse(raw) as Partial<HomeFacts>;
    const parsed = homeFactsSchema.safeParse({
      trust: value.trust ?? {},
      services: Object.fromEntries(mainServiceIds.map(id => [id, value.services?.[id] ?? {}]))
    });
    return parsed.success ? parsed.data : emptyHomeFacts;
  } catch {
    return emptyHomeFacts;
  }
}

/** The four services the site leads with, each with its own landing page. */
export const mainServices: Record<Locale, { id: MainServiceId; href: string; title: string; hook: string; includes: string[] }[]> = {
  uz: [
    { id: "cctv", href: "/xizmat/toshkentda-videokuzatuv-ornatish", title: "Videokuzatuv", hook: "Ofis, do‘kon, ombor va uy uchun IP kameralar", includes: ["Obyektni ko‘rish va kamera nuqtalari", "Kamera, NVR va disk hajmini hisoblash", "Montaj, sozlash va telefondan ko‘rish"] },
    { id: "network", href: "/xizmat/ofis-tarmogi-va-wifi-ornatish", title: "Ofis tarmog‘i va Wi-Fi", hook: "Uzilmaydigan internet va butun ofisga Wi-Fi", includes: ["Tarmoq va Wi-Fi qamrovini tekshirish", "Kabel, kommutator va kirish nuqtalari", "Mehmon va ish tarmog‘ini ajratish"] },
    { id: "audit", href: "/xizmat/kiberxavfsizlik-auditi", title: "Kiberxavfsizlik auditi", hook: "Zaif joylarni hujumchilardan oldin topamiz", includes: ["Qamrov va yozma ruxsatni kelishish", "Tarmoq, server va ilovalarni tekshirish", "Xavf darajasi va tuzatish rejasi"] },
    { id: "support", href: "/xizmat/kompaniyalar-uchun-it-yordam", title: "Oylik IT yordam", hook: "Doimiy IT xodim o‘rniga oylik xizmat", includes: ["Masofaviy va joyida yordam", "Monitoring va zaxira nusxalar nazorati", "Oylik holat hisoboti"] }
  ],
  ru: [
    { id: "cctv", href: "/ru/uslugi/ustanovka-videonablyudeniya-tashkent", title: "Видеонаблюдение", hook: "IP-камеры для офиса, магазина, склада и дома", includes: ["Осмотр объекта и точки камер", "Расчёт камер, NVR и дисков", "Монтаж, настройка и просмотр с телефона"] },
    { id: "network", href: "/ru/uslugi/lokalnaya-set-i-wifi-dlya-ofisa", title: "Сеть и Wi-Fi для офиса", hook: "Стабильный интернет и Wi-Fi на весь офис", includes: ["Проверка сети и покрытия Wi-Fi", "Кабель, коммутаторы и точки доступа", "Разделение гостевой и рабочей сети"] },
    { id: "audit", href: "/ru/uslugi/audit-kiberbezopasnosti", title: "Аудит кибербезопасности", hook: "Найдём слабые места раньше злоумышленников", includes: ["Согласование охвата и письменного разрешения", "Проверка сети, серверов и приложений", "Уровни риска и план исправлений"] },
    { id: "support", href: "/ru/uslugi/it-podderzhka-dlya-kompanii", title: "Ежемесячная IT-поддержка", hook: "Вместо штатного айтишника — ежемесячный сервис", includes: ["Удалённая и выездная помощь", "Мониторинг и контроль резервных копий", "Ежемесячный отчёт о состоянии"] }
  ],
  en: [
    { id: "cctv", href: "/xizmat/toshkentda-videokuzatuv-ornatish", title: "Video surveillance", hook: "IP cameras for offices, shops, warehouses and homes", includes: ["Site survey and camera points", "Cameras, NVR and storage sizing", "Installation, setup and phone viewing"] },
    { id: "network", href: "/xizmat/ofis-tarmogi-va-wifi-ornatish", title: "Office network and Wi-Fi", hook: "Stable internet and Wi-Fi across the office", includes: ["Network and Wi-Fi coverage check", "Cabling, switches and access points", "Separate guest and work networks"] },
    { id: "audit", href: "/xizmat/kiberxavfsizlik-auditi", title: "Security audit", hook: "We find weak spots before attackers do", includes: ["Agreed scope and written permission", "Network, server and application testing", "Risk levels and a fix plan"] },
    { id: "support", href: "/xizmat/kompaniyalar-uchun-it-yordam", title: "Monthly IT support", hook: "A monthly service instead of an in-house IT hire", includes: ["Remote and on-site help", "Monitoring and backup checks", "Monthly status report"] }
  ]
};
