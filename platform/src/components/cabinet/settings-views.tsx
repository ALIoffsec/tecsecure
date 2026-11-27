"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { SiteDialog } from "@/components/site-dialog";
import { UiIcon } from "@/components/ui-icon";
import { AccountSessionActions } from "@/components/account-session-actions";
import { PasswordChangeForm } from "@/components/password-change-form";
import { TelegramLinkCard } from "@/components/code-sign-in";
import { PhoneVerify } from "@/components/phone-verify";
import { TwoFactorSettings } from "@/components/two-factor";
import { useReauth } from "@/components/reauth-dialog";
import { deletionBlockerText, type DeletionBlocker } from "@/lib/account-rules";
import { translateMessage } from "@/lib/server-messages";

export type SettingsState = {
  /** `email` is null for a stand-in address; `storedEmail` is what is saved, sent back unchanged when the person leaves email empty. */
  name: string; email: string | null; storedEmail: string; phone: string | null; phoneVerified: boolean; staff: boolean;
  twoFactor: boolean; telegram: boolean; providers: string[];
};

const words = {
  uz: {
    title: "Sozlamalar", profile: "Shaxsiy ma’lumotlar", security: "Kirish va xavfsizlik", notifications: "Bildirishnomalar", account: "Hisob",
    accountLine: "Chiqish, hisobni o‘chirish", twoFactorOn: "Ikki bosqichli kirish: yoqilgan", twoFactorOff: "Ikki bosqichli kirish: o‘chirilgan",
    telegramOn: "Telegram: ulangan", telegramOff: "Telegram: ulanmagan",
    verified: "Tasdiqlangan", unverified: "Tasdiqlanmagan", missing: "Kiritilmagan", add: "Kiritish", change: "O‘zgartirish",
    name: "Ism", email: "Email", phone: "Telefon", editTitle: "Ma’lumotni o‘zgartirish", save: "Saqlash", saving: "Saqlanmoqda…", close: "Yopish", saved: "Saqlandi.",
    methods: "Kirish usullari", protection: "Himoya", password: "Parol", passwordLine: "Parol bilan kirish", phoneCode: "Telefon kodi", telegram: "Telegram",
    providers: "Boshqa xizmatlar orqali kirish", linked: "ulangan",
    twoFactor: "Ikki bosqichli kirish", sessions: "Boshqa qurilmalar", sessionsLine: (n: number) => n > 0 ? `${n} ta boshqa qurilmada kirilgan` : "Boshqa qurilmada kirilmagan", endAll: "Hammasidan chiqish", ended: "Boshqa qurilmalardan chiqildi.",
    notifyIntro: "Buyurtma, ariza va to‘lov haqidagi xabarlar saytdagi qo‘ng‘iroq belgisida va ulangan Telegram’da keladi.", notifyNoTelegram: "Telegram ulansa, xabarlar u yerga ham keladi.",
    signOut: "Chiqish", signOutLine: "Shu qurilmadan chiqish", deleteTitle: "Hisobni o‘chirish", deleteText: "Hisob yopiladi: kirish, Telegram va boshqa ulanishlar uziladi. Buyurtma va to‘lov yozuvlari saqlanib qoladi. TEC ballari yo‘qoladi.",
    deleteOpen: "Hisobni o‘chirish", deleteConfirm: "Ha, hisobni o‘chirish", deleteBlocked: "Hisobni hozir o‘chirib bo‘lmaydi. Avval shularni hal qiling:", deleteFailed: "Hisobni o‘chirib bo‘lmadi.",
    staffNote: "Xodim hisobi: hisobni o‘chirish administrator orqali.", failed: "Saqlanmadi. Qayta urinib ko‘ring."
  },
  ru: {
    title: "Настройки", profile: "Личные данные", security: "Вход и безопасность", notifications: "Уведомления", account: "Аккаунт",
    accountLine: "Выход, удаление аккаунта", twoFactorOn: "Двухэтапный вход: включён", twoFactorOff: "Двухэтапный вход: выключен",
    telegramOn: "Telegram: подключён", telegramOff: "Telegram: не подключён",
    verified: "Подтверждён", unverified: "Не подтверждён", missing: "Не указан", add: "Указать", change: "Изменить",
    name: "Имя", email: "Email", phone: "Телефон", editTitle: "Изменить данные", save: "Сохранить", saving: "Сохраняется…", close: "Закрыть", saved: "Сохранено.",
    methods: "Способы входа", protection: "Защита", password: "Пароль", passwordLine: "Вход по паролю", phoneCode: "Код по телефону", telegram: "Telegram",
    providers: "Вход через другие сервисы", linked: "подключён",
    twoFactor: "Двухэтапный вход", sessions: "Другие устройства", sessionsLine: (n: number) => n > 0 ? `Выполнен вход на других устройствах: ${n}` : "На других устройствах вход не выполнен", endAll: "Выйти везде", ended: "Выход на других устройствах выполнен.",
    notifyIntro: "Сообщения о заказах, заявках и оплатах приходят в колокольчик на сайте и в подключённый Telegram.", notifyNoTelegram: "Если подключить Telegram, сообщения придут и туда.",
    signOut: "Выйти", signOutLine: "Выйти на этом устройстве", deleteTitle: "Удаление аккаунта", deleteText: "Аккаунт будет закрыт: вход, Telegram и другие привязки отключатся. Записи о заказах и оплатах сохраняются. Баллы TEC пропадут.",
    deleteOpen: "Удалить аккаунт", deleteConfirm: "Да, удалить аккаунт", deleteBlocked: "Сейчас аккаунт удалить нельзя. Сначала решите:", deleteFailed: "Не удалось удалить аккаунт.",
    staffNote: "Аккаунт сотрудника: удаление через администратора.", failed: "Не сохранено. Попробуйте ещё раз."
  },
  en: {
    title: "Settings", profile: "Personal details", security: "Sign-in and security", notifications: "Notifications", account: "Account",
    accountLine: "Sign out, delete the account", twoFactorOn: "Two-step sign-in: on", twoFactorOff: "Two-step sign-in: off",
    telegramOn: "Telegram: connected", telegramOff: "Telegram: not connected",
    verified: "Verified", unverified: "Not verified", missing: "Not added", add: "Add", change: "Change",
    name: "Name", email: "Email", phone: "Phone", editTitle: "Change details", save: "Save", saving: "Saving…", close: "Close", saved: "Saved.",
    methods: "Ways to sign in", protection: "Protection", password: "Password", passwordLine: "Sign in with a password", phoneCode: "Phone code", telegram: "Telegram",
    providers: "Sign in with other services", linked: "connected",
    twoFactor: "Two-step sign-in", sessions: "Other devices", sessionsLine: (n: number) => n > 0 ? `Signed in on ${n} other device${n === 1 ? "" : "s"}` : "Not signed in on other devices", endAll: "Sign out everywhere", ended: "Signed out of other devices.",
    notifyIntro: "News about orders, requests and payments arrives in the bell on the site and in Telegram once connected.", notifyNoTelegram: "Connect Telegram to get the news there too.",
    signOut: "Sign out", signOutLine: "Sign out on this device", deleteTitle: "Delete the account", deleteText: "The account is closed: sign-in, Telegram and other links are removed. Order and payment records are kept. TEC points are lost.",
    deleteOpen: "Delete the account", deleteConfirm: "Yes, delete the account", deleteBlocked: "The account cannot be deleted now. First settle:", deleteFailed: "Could not delete the account.",
    staffNote: "Staff account: deletion goes through an administrator.", failed: "Not saved. Please try again."
  }
} as const;

/** One settings row: name and state on the left, one action on the right. */
function Row({ title, state, children, href }: { title: string; state: string; children?: React.ReactNode; href?: string }) {
  if (href) return <li className="list-row is-clickable-card cab-setting-row">
    <span className="cab-setting-text"><Link className="card-link cab-order-title" href={href}>{title}</Link><small className="muted">{state}</small></span>
    <span aria-hidden="true"><UiIcon name="chevronRight" size={18} /></span>
  </li>;
  return <li className="list-row cab-setting-row">
    <span className="cab-setting-text"><strong>{title}</strong><small className="muted">{state}</small></span>
    {children && <span className="cab-setting-action">{children}</span>}
  </li>;
}

export function SettingsHome({ state }: { state: SettingsState }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const phone = state.phone ? (state.phoneVerified ? w.verified : w.unverified) : w.missing;
  return <section className="panel-card" aria-label={w.title}>
    <ul className="list">
      <Row title={w.profile} state={`${state.name} · ${w.phone}: ${phone}`} href="/portal/settings/profile" />
      <Row title={w.security} state={state.twoFactor ? w.twoFactorOn : w.twoFactorOff} href="/portal/settings/security" />
      <Row title={w.notifications} state={state.telegram ? w.telegramOn : w.telegramOff} href="/portal/settings/notifications" />
      <Row title={w.account} state={w.accountLine} href="/portal/settings/account" />
    </ul>
  </section>;
}

function SettingsTitle({ text }: { text: string }) {
  return <h1 className="cab-title" tabIndex={-1}>{text}</h1>;
}

/** Name, email and phone, each with its state; changes go through one dialog (with re-confirmation when needed). */
export function ProfileSettings({ state }: { state: SettingsState }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  return <>
    <SettingsTitle text={w.profile} />
    {notice && <p className="notice" role="status">{notice}</p>}
    <section className="panel-card">
      <ul className="list">
        <Row title={w.name} state={state.name}><button type="button" className="button secondary" onClick={() => setEditing(true)}>{w.change}<span className="sr-only"> · {w.name}</span></button></Row>
        <Row title={w.email} state={state.email ?? w.missing}><button type="button" className="button secondary" onClick={() => setEditing(true)}>{state.email ? w.change : w.add}<span className="sr-only"> · {w.email}</span></button></Row>
        <Row title={w.phone} state={state.phone ? `${state.phone} · ${state.phoneVerified ? w.verified : w.unverified}` : w.missing}><button type="button" className="button secondary" onClick={() => setEditing(true)}>{state.phone ? w.change : w.add}<span className="sr-only"> · {w.phone}</span></button></Row>
      </ul>
      {!state.staff && state.phone && !state.phoneVerified && <PhoneVerify />}
    </section>
    {editing && <ProfileDialog state={state} onClose={done => { setEditing(false); if (done) setNotice(w.saved); }} />}
  </>;
}

function ProfileDialog({ state, onClose }: { state: SettingsState; onClose: (done: boolean) => void }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const router = useRouter();
  const { guarded, dialog } = useReauth();
  const [name, setName] = useState(state.name);
  const [email, setEmail] = useState(state.email ?? "");
  const [phone, setPhone] = useState(state.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setBusy(true); setError("");
    try {
      const response = await guarded(() => fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email: email.trim() || state.storedEmail, phone }) }));
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(typeof data.error === "string" ? translateMessage(data.error, locale) : w.failed); return; }
      router.refresh();
      onClose(true);
    } catch {
      setError(w.failed);
    } finally {
      setBusy(false);
    }
  }
  return <SiteDialog className="site-dialog cab-dialog" title={w.editTitle} onClose={() => { if (!busy) onClose(false); }}>
    <form className="form" onSubmit={event => { event.preventDefault(); void save(); }}>
      <div className="field"><label htmlFor="settings-name">{w.name}</label><input id="settings-name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={event => setName(event.target.value)} /></div>
      <div className="field"><label htmlFor="settings-email">{w.email}</label><input id="settings-email" type="email" autoComplete="email" maxLength={254} value={email} required={Boolean(state.email)} onChange={event => setEmail(event.target.value)} /></div>
      <div className="field"><label htmlFor="settings-phone">{w.phone}</label><input id="settings-phone" type="tel" autoComplete="tel" maxLength={40} value={phone} onChange={event => setPhone(event.target.value)} /></div>
      {error && <p className="notice error" role="alert">{error}</p>}
      <div className="hero-actions">
        <button type="submit" className="button" disabled={busy}>{busy ? w.saving : w.save}</button>
        <button type="button" className="button ghost" disabled={busy} onClick={() => onClose(false)}>{w.close}</button>
      </div>
    </form>
    {dialog}
  </SiteDialog>;
}

/** Ways to sign in, then protection: two-step sign-in (with its backup codes) and other devices. */
export function SecuritySettings({ state }: { state: SettingsState }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [others, setOthers] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    fetch("/api/auth/sessions", { cache: "no-store" }).then(response => response.ok ? response.json() : null).then(data => { if (live && data && typeof data.others === "number") setOthers(data.others); }).catch(() => {});
    return () => { live = false; };
  }, []);
  async function endOthers() {
    setBusy(true); setError("");
    const response = await fetch("/api/auth/sessions", { method: "DELETE" }).catch(() => null);
    const data = await response?.json().catch(() => ({})) ?? {};
    setBusy(false);
    if (!response?.ok) { setError(typeof data.error === "string" ? translateMessage(data.error, locale) : w.failed); return; }
    setOthers(0); setNotice(w.ended);
  }
  return <>
    <SettingsTitle text={w.security} />
    {notice && <p className="notice" role="status">{notice}</p>}
    {error && <p className="notice error" role="alert">{error}</p>}
    <section className="panel-card" aria-labelledby="settings-methods">
      <h2 id="settings-methods">{w.methods}</h2>
      <ul className="list">
        <Row title={w.password} state={w.passwordLine}><button type="button" className="button secondary" onClick={() => setPasswordOpen(true)}>{w.change}<span className="sr-only"> · {w.password}</span></button></Row>
        <Row title={w.phoneCode} state={state.phone ? `${state.phone} · ${state.phoneVerified ? w.verified : w.unverified}` : w.missing}>
          <Link className="button secondary" href="/portal/settings/profile">{state.phone ? w.change : w.add}<span className="sr-only"> · {w.phone}</span></Link>
        </Row>
        {state.providers.length > 0 && <Row title={w.providers} state={state.providers.map(provider => `${provider} · ${w.linked}`).join(", ")} />}
      </ul>
      {!state.staff && <TelegramLinkCard />}
    </section>
    <section className="panel-card" aria-labelledby="settings-protection">
      <h2 id="settings-protection">{w.protection}</h2>
      <TwoFactorSettings />
      <ul className="list">
        <Row title={w.sessions} state={others === null ? "…" : w.sessionsLine(others)}>
          <button type="button" className="button secondary" disabled={busy || others === 0} onClick={() => void endOthers()}>{w.endAll}</button>
        </Row>
      </ul>
    </section>
    {passwordOpen && <SiteDialog className="site-dialog cab-dialog" title={w.password} onClose={() => setPasswordOpen(false)}><PasswordChangeForm /></SiteDialog>}
  </>;
}

/** Only the channels that really exist in code: the bell on the site and Telegram. No switches for features that do not exist. */
export function NotificationSettings({ state }: { state: SettingsState }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  return <>
    <SettingsTitle text={w.notifications} />
    <section className="panel-card">
      <p>{w.notifyIntro}</p>
      <ul className="list">
        <Row title={w.telegram} state={state.telegram ? w.telegramOn : w.telegramOff} />
      </ul>
      {!state.telegram && <p className="small muted">{w.notifyNoTelegram}</p>}
      {!state.staff && <TelegramLinkCard />}
    </section>
  </>;
}

const resetWords = {
  uz: { title: "O‘qish progressi", text: "Bajarilgan bo‘limlar belgisi o‘chiriladi. Olingan TEC, sertifikatlar va xaridlar qoladi.", open: "Progressni tozalash", confirm: "Ha, progressni tozalash", done: "O‘qish progressi tozalandi.", close: "Yopish" },
  ru: { title: "Прогресс обучения", text: "Отметки о пройденных разделах будут удалены. Полученные TEC, сертификаты и покупки останутся.", open: "Сбросить прогресс", confirm: "Да, сбросить прогресс", done: "Прогресс обучения сброшен.", close: "Закрыть" },
  en: { title: "Learning progress", text: "Your finished-section marks are removed. TEC earned, certificates and purchases stay.", open: "Clear progress", confirm: "Yes, clear progress", done: "Learning progress cleared.", close: "Close" }
} as const;

/** Clearing the learning progress: on the server and in this browser, after a clear confirmation. */
function LearningReset() {
  const { locale } = useSitePreferences();
  const r = resetWords[locale];
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  async function clear() {
    setBusy(true); setError("");
    const response = await fetch("/api/learning/progress", { method: "DELETE" }).catch(() => null);
    const data = await response?.json().catch(() => ({})) ?? {};
    setBusy(false);
    if (!response?.ok) { setError(typeof data.error === "string" ? translateMessage(data.error, locale) : r.title); return; }
    try { window.localStorage.removeItem("tecsecure-learning-demo-v1"); } catch { /* the server copy is what counts */ }
    setOpen(false); setNotice(r.done);
  }
  return <section className="panel-card" aria-labelledby="settings-learning-reset">
    <h2 id="settings-learning-reset">{r.title}</h2>
    {notice && <p className="notice" role="status">{notice}</p>}
    {error && <p className="notice error" role="alert">{error}</p>}
    <p className="small muted">{r.text}</p>
    <button type="button" className="button secondary" onClick={() => setOpen(true)}>{r.open}</button>
    {open && <SiteDialog className="site-dialog cab-dialog" title={r.title} onClose={() => { if (!busy) setOpen(false); }}>
      <p>{r.text}</p>
      <div className="hero-actions">
        <button type="button" className="button danger" disabled={busy} onClick={() => void clear()}>{r.confirm}</button>
        <button type="button" className="button ghost" disabled={busy} onClick={() => setOpen(false)}>{r.close}</button>
      </div>
    </SiteDialog>}
  </section>;
}

/** Sign out, and closing the account at the very bottom, with what stands in the way as links. */
export function AccountSettings({ state }: { state: SettingsState }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const router = useRouter();
  const { guarded, dialog } = useReauth();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [blockers, setBlockers] = useState<DeletionBlocker[]>([]);
  async function remove() {
    setBusy(true); setError(""); setBlockers([]);
    try {
      const response = await guarded(() => fetch("/api/auth/account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }));
      const data = await response.clone().json().catch(() => ({}));
      if (!response.ok) {
        if (data.code === "DELETE_BLOCKED" && Array.isArray(data.blockers)) { setBlockers(data.blockers); setConfirming(false); return; }
        setError(typeof data.error === "string" ? translateMessage(data.error, locale) : w.deleteFailed);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError(w.deleteFailed);
    } finally {
      setBusy(false);
    }
  }
  return <>
    <SettingsTitle text={w.account} />
    <section className="panel-card">
      <ul className="list"><Row title={w.signOut} state={w.signOutLine}><AccountSessionActions compact /></Row></ul>
    </section>
    {!state.staff && <LearningReset />}
    <section className="panel-card account-danger-zone" aria-labelledby="settings-delete">
      <h2 id="settings-delete">{w.deleteTitle}</h2>
      {state.staff ? <p className="small muted">{w.staffNote}</p> : <>
        <p className="small muted">{w.deleteText}</p>
        {blockers.length > 0 && <div className="notice error" role="alert"><p>{w.deleteBlocked}</p><ul>{blockers.map(key => <li key={key}><Link href={deletionBlockerText[locale][key].href}>{deletionBlockerText[locale][key].text}</Link></li>)}</ul></div>}
        {error && <p className="notice error" role="alert">{error}</p>}
        <button type="button" className="button danger" onClick={() => setConfirming(true)}>{w.deleteOpen}</button>
      </>}
    </section>
    {confirming && <SiteDialog className="site-dialog cab-dialog" title={w.deleteTitle} onClose={() => { if (!busy) setConfirming(false); }}>
      <p>{w.deleteText}</p>
      <div className="hero-actions">
        <button type="button" className="button danger" disabled={busy} onClick={() => void remove()}>{busy ? w.saving : w.deleteConfirm}</button>
        <button type="button" className="button ghost" disabled={busy} onClick={() => setConfirming(false)}>{w.close}</button>
      </div>
    </SiteDialog>}
    {dialog}
  </>;
}
