/**
 * The customer cabinet's pages: one list for the side menu and the phone hub, the move table from the old
 * `/portal/profile?section=` addresses, and each page's parent for the back link. Pure, so it is tested alone.
 */
export type CabinetSection = "home" | "orders" | "requests" | "learning" | "certificates" | "wallet" | "devices" | "settings" | "messages";
export type CabinetIcon = "home" | "truck" | "clipboard" | "book" | "wallet" | "server" | "settings" | "mail" | "shield";
export type CabinetGroup = "account" | "purchases" | "study";

/**
 * The cabinet's menu in three groups (the same in the side menu and the avatar menu). Learning lives in its
 * own part of the site, so its two items lead out of the cabinet.
 */
export const cabinetSections: { id: CabinetSection; href: string; icon: CabinetIcon; group: CabinetGroup; optional?: boolean }[] = [
  { id: "home", href: "/portal", icon: "home", group: "account" },
  { id: "settings", href: "/portal/settings", icon: "settings", group: "account" },
  { id: "orders", href: "/portal/orders", icon: "truck", group: "purchases" },
  { id: "requests", href: "/portal/requests", icon: "clipboard", group: "purchases" },
  { id: "wallet", href: "/portal/wallet", icon: "wallet", group: "purchases" },
  { id: "devices", href: "/portal/devices", icon: "server", group: "purchases", optional: true },
  { id: "learning", href: "/learning", icon: "book", group: "study" },
  { id: "certificates", href: "/learning/certifications", icon: "shield", group: "study" }
];
export const CABINET_GROUPS: CabinetGroup[] = ["account", "purchases", "study"];

export const cabinetLabels: Record<"uz" | "ru" | "en", Record<CabinetSection, string> & { nav: string; signOut: string; order: string; profile: string; groups: Record<CabinetGroup, string> }> = {
  uz: { home: "Bosh sahifa", orders: "Buyurtmalarim", requests: "Arizalarim", learning: "Mening o‘qishim", wallet: "Hamyon va TEC", devices: "Qurilmalarim", settings: "Sozlamalar", messages: "Xabarlarim", certificates: "Sertifikatlarim", profile: "Profil", nav: "Kabinet bo‘limlari", signOut: "Chiqish", order: "Buyurtma", groups: { account: "Hisob", purchases: "Xaridlar", study: "O‘qish" } },
  ru: { home: "Главная", orders: "Мои заказы", requests: "Мои заявки", learning: "Моё обучение", wallet: "Кошелёк и TEC", devices: "Мои устройства", settings: "Настройки", messages: "Мои сообщения", certificates: "Мои сертификаты", profile: "Профиль", nav: "Разделы кабинета", signOut: "Выйти", order: "Заказ", groups: { account: "Аккаунт", purchases: "Покупки", study: "Обучение" } },
  en: { home: "Home", orders: "My orders", requests: "My requests", learning: "My learning", wallet: "Wallet and TEC", devices: "My devices", settings: "Settings", messages: "My messages", certificates: "My certificates", profile: "Profile", nav: "Account sections", signOut: "Sign out", order: "Order", groups: { account: "Account", purchases: "Purchases", study: "Learning" } }
};

/** Where an old `?section=` address now lives. Unknown sections land on the cabinet's home. */
export function legacyPortalPath(section: string | null | undefined): string {
  switch (section) {
    case "profile": return "/portal/settings";
    case "requests": case "projects": case "invoices": return "/portal/requests";
    case "orders": return "/portal/orders";
    case "wallet": return "/portal/wallet";
    case "monitoring": case "subscriptions": return "/portal/devices";
    case "messages": return "/portal/messages";
    case "learning": return "/learning";
    case "store": return "/store";
    default: return "/portal";
  }
}

/** The section a cabinet address belongs to (an inner page counts as its parent section). */
export function cabinetSectionOf(pathname: string): CabinetSection | null {
  if (pathname === "/portal") return "home";
  // A payment invoice belongs to the request it is for.
  if (pathname.startsWith("/portal/invoices/")) return "requests";
  const match = cabinetSections.find(item => item.id !== "home" && item.href.startsWith("/portal") && (pathname === item.href || pathname.startsWith(`${item.href}/`)));
  return match?.id ?? null;
}

/** The page "←" goes to: the list for an inner page, the cabinet's home for a section. Null on the home itself. */
export function cabinetParent(pathname: string): { href: string; section: CabinetSection } | null {
  if (!pathname.startsWith("/portal") || pathname === "/portal") return null;
  const section = cabinetSectionOf(pathname);
  if (!section) return { href: "/portal", section: "home" };
  const own = cabinetSections.find(item => item.id === section)!;
  if (!pathname.startsWith(own.href)) return { href: own.href, section };
  if (pathname === own.href) return { href: "/portal", section: "home" };
  // Deeper pages go up one level: an order's invoice back to that order, an order back to the list.
  const rest = pathname.slice(own.href.length + 1).split("/").filter(Boolean);
  return { href: rest.length > 1 ? `${own.href}/${rest.slice(0, -1).join("/")}` : own.href, section };
}
