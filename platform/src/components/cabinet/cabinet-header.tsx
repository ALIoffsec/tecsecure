"use client";

import Link from "next/link";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";
import { AccountMenu } from "@/components/account-menu";
import { unreadBadge } from "@/lib/notifications";
import { formatMinor, formatNumber } from "@/lib/format";
import type { CabinetUser } from "./cabinet-frame";

const words = {
  uz: { bell: "Bildirishnomalar", unread: (n: number) => `${n} ta o‘qilmagan`, staff: "Siz xodim hisobidasiz. Mijoz bo‘limlari bu hisob uchun bo‘sh.", panel: "Boshqaruv paneli", menu: "Hisob menyusi", wallet: "Hamyon", level: (l: number, x: number, y: number) => `Daraja ${l} · ${x}/${y} XP` },
  ru: { bell: "Уведомления", unread: (n: number) => `непрочитанных: ${n}`, staff: "Вы вошли как сотрудник. Разделы клиента для этого аккаунта пусты.", panel: "Панель управления", menu: "Меню аккаунта", wallet: "Кошелёк", level: (l: number, x: number, y: number) => `Уровень ${l} · ${x}/${y} XP` },
  en: { bell: "Notifications", unread: (n: number) => `${n} unread`, staff: "You are signed in as staff. Customer sections are empty for this account.", panel: "Admin panel", menu: "Account menu", wallet: "Wallet", level: (l: number, x: number, y: number) => `Level ${l} · ${x}/${y} XP` }
} as const;

export type HomeHead = { walletMinor: number; tec: number; level: number; xp: number; nextXp: number };

/**
 * The cabinet's head. On the home page it is the identity card: the avatar (opens the account menu), the
 * name (the page's one h1), the masked phone, the bell, and two numbers — the wallet and TEC with the
 * learning level. On inner pages a compact line, shown on a computer only.
 */
export function CabinetHeader({ user, unread, home }: { user: CabinetUser; unread: number; home?: HomeHead }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const badge = unreadBadge(unread);
  const avatar = <AccountMenu className="cab-avatar cab-avatar-button" label={w.menu} who={{ name: user.name, maskedPhone: user.maskedPhone }}>{user.name.slice(0, 1).toUpperCase()}</AccountMenu>;
  const bell = <Link className="button ghost cab-bell" href="/portal/notifications" aria-label={badge ? `${w.bell}, ${w.unread(unread)}` : w.bell}>
    <UiIcon name="bell" />
    {badge && <span className="cab-bell-count" aria-hidden="true">{badge}</span>}
  </Link>;
  return <>
    {home ? <header className="cab-id-card">
      <div className="cab-id-top">
        {avatar}
        <span className="cab-identity">
          <h1 className="cab-title cab-hello" tabIndex={-1}>{user.name}</h1>
          {user.maskedPhone && <small>{user.maskedPhone}</small>}
        </span>
        {bell}
      </div>
      <div className="cab-id-stats">
        <Link href="/portal/wallet" className="cab-id-stat">
          <small>{w.wallet}</small>
          <strong>{formatMinor(home.walletMinor, "UZS", locale)}</strong>
        </Link>
        <Link href="/learning" className="cab-id-stat">
          <small>TEC</small>
          <strong>{formatNumber(home.tec, 0)}</strong>
          <small>{w.level(home.level, home.xp, home.nextXp)}</small>
        </Link>
      </div>
    </header> : <header className="cab-head is-inner">
      {avatar}
      <span className="cab-identity"><strong>{user.name}</strong>{(user.maskedPhone ?? user.contact) && <small>{user.maskedPhone ?? user.contact}</small>}</span>
      {bell}
    </header>}
    {user.staff && <p className="notice cab-staff-note">{w.staff} <Link href="/admin">{w.panel}</Link></p>}
  </>;
}
