/**
 * The customer cabinet's pages: one list for the side menu and the phone hub, the move table from the old
 * `/portal/profile?section=` addresses, and each page's parent for the back link. Pure, so it is tested alone.
 */
export type CabinetSection = "home" | "orders" | "requests" | "learning" | "wallet" | "devices" | "settings" | "messages";
export type CabinetIcon = "home" | "truck" | "clipboard" | "book" | "wallet" | "server" | "settings" | "mail";

export const cabinetSections: { id: CabinetSection; href: string; icon: CabinetIcon; optional?: boolean }[] = [
  { id: "home", href: "/portal", icon: "home" },
  { id: "orders", href: "/portal/orders", icon: "truck" },
  { id: "requests", href: "/portal/requests", icon: "clipboard" },
  { id: "learning", href: "/portal/learning", icon: "book", optional: true },
  { id: "wallet", href: "/portal/wallet", icon: "wallet" },
  { id: "devices", href: "/portal/devices", icon: "server", optional: true },
  { id: "settings", href: "/portal/settings", icon: "settings" },
  { id: "messages", href: "/portal/messages", icon: "mail" }
];

export const cabinetLabels: Record<"uz" | "ru" | "en", Record<CabinetSection, string> & { nav: string; signOut: string; order: string }> = {
  uz: { home: "Bosh sahifa", orders: "Buyurtmalarim", requests: "Arizalarim", learning: "Mening o‘qishim", wallet: "Hamyon va TEC", devices: "Qurilmalarim", settings: "Sozlamalar", messages: "Xabarlarim", nav: "Kabinet bo‘limlari", signOut: "Chiqish", order: "Buyurtma" },
  ru: { home: "Главная", orders: "Мои заказы", requests: "Мои заявки", learning: "Моё обучение", wallet: "Кошелёк и TEC", devices: "Мои устройства", settings: "Настройки", messages: "Мои сообщения", nav: "Разделы кабинета", signOut: "Выйти", order: "Заказ" },
  en: { home: "Home", orders: "My orders", requests: "My requests", learning: "My learning", wallet: "Wallet and TEC", devices: "My devices", settings: "Settings", messages: "My messages", nav: "Account sections", signOut: "Sign out", order: "Order" }
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
    case "learning": return "/portal/learning";
    case "store": return "/store";
    default: return "/portal";
  }
}

/** The section a cabinet address belongs to (an inner page counts as its parent section). */
export function cabinetSectionOf(pathname: string): CabinetSection | null {
  if (pathname === "/portal") return "home";
  // A payment invoice belongs to the request it is for.
  if (pathname.startsWith("/portal/invoices/")) return "requests";
  const match = cabinetSections.find(item => item.id !== "home" && (pathname === item.href || pathname.startsWith(`${item.href}/`)));
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
