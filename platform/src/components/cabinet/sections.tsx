"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { OrganizationSetupForm } from "@/components/organization-setup-form";
import { DeviceRegisterForm } from "@/components/device-register-form";
import { SubscriptionManager } from "@/components/subscription-manager";
import { PortalMessageForm } from "@/components/portal-message-form";
import { formatDate, formatDateTime } from "@/lib/format";
import { statusLabel, toneClass, type StatusKind } from "@/lib/status-labels";
import { cabinetLabels } from "@/lib/cabinet-routes";
import { isWrongAddress } from "@/lib/monitoring-rules";

/** A status badge in words, from the shared list; colour always comes with text. */
export function StatusBadge({ kind, code }: { kind: StatusKind; code: string }) {
  const { locale } = useSitePreferences();
  const label = statusLabel(kind, code, locale);
  return <span className={`order-status ${toneClass[label.tone]}`.trim()}>{label.text}</span>;
}

/** Each cabinet page starts with its one h1. */
export function CabinetTitle({ section }: { section: keyof typeof cabinetLabels.uz }) {
  const { locale } = useSitePreferences();
  return <h1 className="cab-title" tabIndex={-1}>{cabinetLabels[locale][section]}</h1>;
}

type Organization = {
  id: string; name: string; locations: { id: string; name: string; address: string }[];
  devices: { id: string; type: string; model: string | null; status: string; lastCheckAt: Date | string | null; monitored: boolean; warrantyEndsAt?: Date | string | null; warrantyVerified?: boolean; checks?: { detail: string | null }[] }[];
};
type PlanRecord = { id: string; name: string; interval: string; priceMinor: number | null; currency: string; trialDays: number; features: unknown };
type SubscriptionRecord = {
  id: string; status: string; trialEndsAt: Date | null; consentAt: Date | null;
  plan: { name: string; interval: string; priceMinor: number | null; currency: string };
  organization: { name: string };
};

/** Organisations, their devices, adding the first one, and monitoring subscriptions. */
const deviceWords = {
  uz: { lastCheck: "oxirgi tekshiruv", warranty: "Kafolat", wrongAddress: "Manzil noto‘g‘ri" },
  ru: { lastCheck: "последняя проверка", warranty: "Гарантия до", wrongAddress: "Неверный адрес" },
  en: { lastCheck: "last check", warranty: "Warranty until", wrongAddress: "Wrong address" }
} as const;
/** Devices that do not respond come first. */
const deviceRank = (status: string) => status === "OFFLINE" ? 0 : status === "STALE" ? 1 : status === "UNKNOWN" ? 3 : 2;

export function DevicesSection({ organizations, plans, subscriptions }: { organizations: Organization[]; plans: PlanRecord[]; subscriptions: SubscriptionRecord[] }) {
  const { locale, t } = useSitePreferences();
  return <>
    <section className="panel-card" id="organizations">
      <h2>{cabinetLabels[locale].devices}</h2>
      {organizations.length ? organizations.map((organization) => (
        <div key={organization.id} className="cab-block">
          <h3>{organization.name}</h3>
          {organization.locations.map((location) => <p className="small muted" key={location.id}>{location.name} · {location.address}</p>)}
          {organization.devices.length ? <ul className="list">{[...organization.devices].sort((a, b) => deviceRank(a.status) - deviceRank(b.status)).map((device) => {
            const wrong = device.monitored && device.status !== "ONLINE" && isWrongAddress(device.checks?.[0]?.detail);
            return <li key={device.id} className="list-row cab-device-row">
              <span>
                <strong>{device.type} {device.model ?? ""}</strong>
                <small className="muted">{t("monitoring")}: {device.monitored ? t("enabled") : t("disabled")}{device.lastCheckAt ? ` · ${deviceWords[locale].lastCheck}: ${formatDateTime(device.lastCheckAt)}` : ""}</small>
                {device.warrantyVerified && device.warrantyEndsAt && <small className="muted">{deviceWords[locale].warranty}: {formatDate(device.warrantyEndsAt)}</small>}
              </span>
              {wrong ? <span className="order-status is-cancelled">{deviceWords[locale].wrongAddress}</span> : <StatusBadge kind="device" code={device.status} />}
            </li>;
          })}</ul> : <p className="muted">{t("noDeviceDetails")}</p>}
        </div>
      )) : <div className="empty-state checkout-empty"><p>{t("noOrganizations")}</p></div>}
      <h3>{t("addOrganization")}</h3>
      <OrganizationSetupForm />
      <h3>{t("registerDevice")}</h3>
      <DeviceRegisterForm organizations={organizations.map(({ id, name }) => ({ id, name }))} />
    </section>
    <div id="subscriptions"><SubscriptionManager organizations={organizations.map(({ id, name }) => ({ id, name }))} plans={plans} subscriptions={subscriptions} /></div>
  </>;
}

const messageCopy = {
  uz: { placeholder: "Xabaringizni yozing...", submit: "Xabar yuborish", submitting: "Yuborilmoqda...", sent: "Xabar yuborildi. Javob shu yerda ko‘rinadi.", botUnavailable: "Xabar saytda saqlandi, ammo administratorga bildirishnoma yuborilmadi.", failed: "Xabar yuborilmadi. Qayta urinib ko‘ring.", empty: "Xabarlaringiz va javoblar shu yerda ko‘rinadi." },
  ru: { placeholder: "Напишите сообщение...", submit: "Отправить сообщение", submitting: "Отправка...", sent: "Сообщение отправлено. Ответ появится здесь.", botUnavailable: "Сообщение сохранено на сайте, но уведомление администратору не отправлено.", failed: "Не удалось отправить сообщение. Попробуйте ещё раз.", empty: "Ваши сообщения и ответы появятся здесь." },
  en: { placeholder: "Write your message...", submit: "Send message", submitting: "Sending...", sent: "Message sent. Replies will appear here.", botUnavailable: "Message saved on the site, but the administrator notification was not delivered.", failed: "Could not send the message. Please try again.", empty: "Your messages and replies will appear here." }
} as const;

type ConversationRecord = { id: string; reference: string; category: string; subject: string; createdAt: Date | string; status?: string; unread?: number; messages: { id: string; sender: string; body: string; createdAt: Date | string }[] };

const replyWords = {
  uz: { label: "Javob yozish", send: "Yuborish", sending: "Yuborilmoqda…", failed: "Yuborilmadi. Qayta urinib ko‘ring.", closed: "yopilgan", unread: (n: number) => `${n} ta yangi javob` },
  ru: { label: "Написать ответ", send: "Отправить", sending: "Отправляется…", failed: "Не отправлено. Попробуйте ещё раз.", closed: "закрыт", unread: (n: number) => `новых ответов: ${n}` },
  en: { label: "Write a reply", send: "Send", sending: "Sending…", failed: "Not sent. Please try again.", closed: "closed", unread: (n: number) => `${n} new ${n === 1 ? "reply" : "replies"}` }
} as const;

/** A reply in one of the customer's own conversations (a closed one opens again). Text only, never HTML. */
function ConversationReply({ id }: { id: string }) {
  const router = useRouter();
  const { locale } = useSitePreferences();
  const w = replyWords[locale];
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <form className="form portal-reply" onSubmit={async event => {
    event.preventDefault();
    if (!text.trim()) return;
    setBusy(true); setError("");
    const response = await fetch(`/api/portal/messages/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text.trim() }) }).catch(() => null);
    setBusy(false);
    if (!response?.ok) { setError(w.failed); return; }
    setText("");
    router.refresh();
  }}>
    <label className="sr-only" htmlFor={`reply-${id}`}>{w.label}</label>
    <textarea id={`reply-${id}`} rows={2} maxLength={3000} placeholder={w.label} value={text} onChange={event => setText(event.target.value)} />
    {error && <p className="notice error" role="alert">{error}</p>}
    <button className="button secondary small" disabled={busy || !text.trim()}>{busy ? w.sending : w.send}</button>
  </form>;
}

/** The message form and the conversations, as before. */
export function MessagesSection({ conversations, userName }: { conversations: ConversationRecord[]; userName: string }) {
  const router = useRouter();
  const { locale, t } = useSitePreferences();
  const c = messageCopy[locale];
  return <section className="panel-card">
    <div className="portal-section-heading"><h2>{cabinetLabels[locale].messages}</h2><button className="button ghost" type="button" onClick={() => router.refresh()}>{t("refresh")}</button></div>
    <PortalMessageForm copy={{ placeholder: c.placeholder, submit: c.submit, submitting: c.submitting, sent: c.sent, botUnavailable: c.botUnavailable, failed: c.failed }} />
    {conversations.length ? <div className="portal-conversations">{conversations.map((conversation) => <article className="portal-conversation" key={conversation.id}>
      <header><div><h3>{conversation.subject}</h3><small className="muted">{conversation.reference} · {formatDate(conversation.createdAt)}{conversation.status === "CLOSED" ? ` · ${replyWords[locale].closed}` : ""}</small></div>{(conversation.unread ?? 0) > 0 && <span className="order-status is-review">{replyWords[locale].unread(conversation.unread!)}</span>}</header>
      <div className="portal-message-list">{conversation.messages.map((message) => <div className={`portal-message ${message.sender === "ADMIN" ? "from-admin" : ""}`} key={message.id}>
        <strong>{message.sender === "ADMIN" ? "Tecsecure" : userName}</strong>
        <p>{message.body}</p>
        <small className="muted">{formatDateTime(message.createdAt)}</small>
      </div>)}</div>
      <ConversationReply id={conversation.id} />
    </article>)}</div> : <div className="empty-state checkout-empty"><p>{c.empty}</p></div>}
  </section>;
}
