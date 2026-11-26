"use client";

import Link from "next/link";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";
import { unreadBadge } from "@/lib/notifications";
import { formatMinor, formatNumber } from "@/lib/format";
import { cabinetLabels } from "@/lib/cabinet-routes";
import type { CabinetUser } from "./cabinet-frame";

const words = {
  uz: { bell: "Bildirishnomalar", unread: (n: number) => `${n} ta o‘qilmagan`, staff: "Siz xodim hisobidasiz. Mijoz bo‘limlari bu hisob uchun bo‘sh.", panel: "Boshqaruv paneli", hello: (name: string) => `Salom, ${name}`, wallet: "Hamyon" },
  ru: { bell: "Уведомления", unread: (n: number) => `непрочитанных: ${n}`, staff: "Вы вошли как сотрудник. Разделы клиента для этого аккаунта пусты.", panel: "Панель управления", hello: (name: string) => `Здравствуйте, ${name}`, wallet: "Кошелёк" },
  en: { bell: "Notifications", unread: (n: number) => `${n} unread`, staff: "You are signed in as staff. Customer sections are empty for this account.", panel: "Admin panel", hello: (name: string) => `Hello, ${name}`, wallet: "Wallet" }
} as const;

/**
 * The compact head of the cabinet. On the cabinet's home it greets the customer (the page's one h1), shows the
 * wallet in one line and leads to settings; on an inner page it is the initial, name and real contact, shown on
 * a computer only (the page title is that page's h1).
 */
export function CabinetHeader({ user, unread, home }: { user: CabinetUser; unread: number; home?: { walletMinor: number; tec: number } }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const badge = unreadBadge(unread);
  const settings = cabinetLabels[locale].settings;
  return <>
    <header className={`cab-head${home ? " is-home" : " is-inner"}`}>
      <span className="cab-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
      {home
        ? <span className="cab-identity">
          <h1 className="cab-title cab-hello" tabIndex={-1}>{w.hello(user.name)}</h1>
          <small>{w.wallet} {formatMinor(home.walletMinor, "UZS", locale)} · {formatNumber(home.tec, 0)} TEC</small>
        </span>
        : <span className="cab-identity"><strong>{user.name}</strong>{user.contact && <small>{user.contact}</small>}</span>}
      <Link className="button ghost cab-bell" href="/portal/notifications" aria-label={badge ? `${w.bell}, ${w.unread(unread)}` : w.bell}>
        <UiIcon name="bell" />
        {badge && <span className="cab-bell-count" aria-hidden="true">{badge}</span>}
      </Link>
      {home && <Link className="button ghost cab-head-settings" href="/portal/settings" aria-label={settings}>
        <UiIcon name="settings" />
        <span className="cab-head-label" aria-hidden="true">{settings}</span>
      </Link>}
    </header>
    {user.staff && <p className="notice cab-staff-note">{w.staff} <Link href="/admin">{w.panel}</Link></p>}
  </>;
}
