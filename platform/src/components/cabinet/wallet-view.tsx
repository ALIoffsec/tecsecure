"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { SiteDialog } from "@/components/site-dialog";
import { MediaUploader } from "@/components/media-uploader";
import { UiIcon } from "@/components/ui-icon";
import type { PaymentCard } from "@/components/cart-checkout";
import { formatDate, formatMinor, formatNumber } from "@/lib/format";
import { parseSomInput } from "@/lib/money-input";
import { translateMessage } from "@/lib/server-messages";
import { walletStatusLabels } from "@/lib/wallet-rules";
import { LEDGER_FILTERS, ledgerMatches, ledgerNames, ledgerSign, withdrawable, type LedgerFilter } from "@/lib/wallet-view";

type Entry = { id: string; kind: string; status: string; amountMinor: number; reference: string | null; details: string | null; createdAt: Date | string };

const words = {
  uz: {
    balance: "Hamyonda", tec: "TEC", moneyTitle: "Pul", buyTec: "TEC sotib olish", whatTec: "TEC nima?", topUp: "To‘ldirish", withdraw: "Yechish", pending: "Kutilayotgan so‘rov", cancel: "So‘rovni bekor qilish",
    noCard: "Karta orqali to‘ldirish hozircha sozlanmagan. Bizga yozing.", write: "Xabar yozish", tecNote: "TEC sotib olish va ta’lim obunasi", store: "TEC va obuna",
    history: "Harakatlar", filters: { all: "Hammasi", in: "Kirim", out: "Chiqim", tec: "TEC" }, empty: "Hozircha harakat yo‘q.", filterLabel: "Harakatlarni saralash",
    steps: ["Summa", "Karta", "Chek"], amount: "Summa (so‘m)", next: "Keyingi", back: "Orqaga", card: "Shu kartaga o‘tkazing", copy: "Karta raqamidan nusxa olish", copied: "Nusxa olindi",
    reference: "To‘lov cheki raqami yoki izoh", proof: "Chek rasmi", send: "Yuborish", sending: "Yuborilmoqda…", close: "Yopish", sent: "So‘rov yuborildi. Xodim tekshiradi.",
    available: (amount: string) => `Yechish mumkin: ${amount}`, details: "Pulni qayerga o‘tkazamiz?", detailsHint: "Qabul qiluvchi va qanday o‘tkazish (xodim siz bilan bog‘lanib aniqlaydi).",
    badAmount: "Summani raqam bilan yozing.", overAvailable: "Summa yechish mumkin bo‘lgan qismdan oshmasin.", needProof: "Chek rasmini yuklang.", needReference: "Chek raqamini yoki izohni kamida 2 belgida yozing.", failed: "Yuborilmadi. Qayta urinib ko‘ring.",
    statuses: { PENDING: "Kutilmoqda", APPROVED: "Tasdiqlandi", REJECTED: "Rad etildi" } as Record<string, string>
  },
  ru: {
    balance: "В кошельке", tec: "TEC", moneyTitle: "Деньги", buyTec: "Купить TEC", whatTec: "Что такое TEC?", topUp: "Пополнить", withdraw: "Вывести", pending: "Заявка ждёт проверки", cancel: "Отменить заявку",
    noCard: "Пополнение картой пока не настроено. Напишите нам.", write: "Написать", tecNote: "Покупка TEC и подписка на обучение", store: "TEC и подписка",
    history: "Операции", filters: { all: "Все", in: "Поступления", out: "Списания", tec: "TEC" }, empty: "Операций пока нет.", filterLabel: "Фильтр операций",
    steps: ["Сумма", "Карта", "Чек"], amount: "Сумма (сум)", next: "Далее", back: "Назад", card: "Переведите на эту карту", copy: "Скопировать номер карты", copied: "Скопировано",
    reference: "Номер чека или комментарий", proof: "Фото чека", send: "Отправить", sending: "Отправляется…", close: "Закрыть", sent: "Заявка отправлена. Сотрудник проверит.",
    available: (amount: string) => `Можно вывести: ${amount}`, details: "Куда перевести деньги?", detailsHint: "Получатель и способ перевода (сотрудник свяжется и уточнит).",
    badAmount: "Укажите сумму цифрами.", overAvailable: "Сумма больше доступной для вывода.", needProof: "Загрузите фото чека.", needReference: "Номер чека или комментарий: не меньше 2 символов.", failed: "Не отправлено. Попробуйте ещё раз.",
    statuses: { PENDING: "Ожидает", APPROVED: "Подтверждено", REJECTED: "Отклонено" } as Record<string, string>
  },
  en: {
    balance: "In the wallet", tec: "TEC", moneyTitle: "Money", buyTec: "Buy TEC", whatTec: "What is TEC?", topUp: "Top up", withdraw: "Withdraw", pending: "Request waiting for review", cancel: "Cancel request",
    noCard: "Card top-up is not set up yet. Write to us.", write: "Write to us", tecNote: "Buy TEC and learning plans", store: "TEC and plans",
    history: "Activity", filters: { all: "All", in: "In", out: "Out", tec: "TEC" }, empty: "No activity yet.", filterLabel: "Filter activity",
    steps: ["Amount", "Card", "Receipt"], amount: "Amount (UZS)", next: "Next", back: "Back", card: "Transfer to this card", copy: "Copy the card number", copied: "Copied",
    reference: "Receipt number or note", proof: "Receipt photo", send: "Send", sending: "Sending…", close: "Close", sent: "Request sent. Staff will check it.",
    available: (amount: string) => `You can withdraw: ${amount}`, details: "Where should we send the money?", detailsHint: "Recipient and how to transfer (staff will contact you to confirm).",
    badAmount: "Enter the amount in digits.", overAvailable: "The amount is more than you can withdraw.", needProof: "Upload the receipt photo.", needReference: "Write the receipt number or a note of at least 2 characters.", failed: "Not sent. Please try again.",
    statuses: { PENDING: "Pending", APPROVED: "Approved", REJECTED: "Rejected" } as Record<string, string>
  }
} as const;

/**
 * "Wallet and TEC": both balances side by side, a request still waiting on top, top-up in three steps and
 * withdrawal in their own windows, then the activity in words with a +/− sign.
 */
export function WalletView({ balanceMinor, points, entries, paymentCard, startTopUp }: { balanceMinor: number; points: number; entries: Entry[]; paymentCard: PaymentCard | null; startTopUp: number | null }) {
  const { locale, t } = useSitePreferences();
  const w = words[locale];
  const router = useRouter();
  const [dialog, setDialog] = useState<"topup" | "withdraw" | null>(startTopUp && paymentCard ? "topup" : null);
  const [filter, setFilter] = useState<LedgerFilter>("all");
  const [tecInfo, setTecInfo] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = entries.filter(entry => entry.status === "PENDING" && (entry.kind === "DEPOSIT" || entry.kind === "WITHDRAWAL"));
  const shown = entries.filter(entry => ledgerMatches(entry, filter));
  const name = (kind: string) => ledgerNames[locale][kind] ?? ledgerNames[locale].OTHER;
  const statusWord = (status: string) => status === "CANCELLED" ? walletStatusLabels[locale].CANCELLED : w.statuses[status] ?? w.statuses.PENDING;

  async function cancelRequest(id: string) {
    setBusy(true); setError("");
    const response = await fetch(`/api/wallet/${id}`, { method: "DELETE" }).catch(() => null);
    const data = await response?.json().catch(() => ({})) ?? {};
    setBusy(false);
    if (!response?.ok) { setError(typeof data.error === "string" ? translateMessage(data.error, locale) : w.failed); return; }
    router.refresh();
  }

  return <>
    {notice && <p className="notice" role="status">{notice}</p>}
    {error && <p className="notice error" role="alert">{error}</p>}
    {pending.length > 0 && <section className="cab-block-plain" aria-labelledby="wallet-pending">
      <h2 id="wallet-pending" className="cab-h2">{w.pending}</h2>
      <ul className="cab-attention">{pending.map(entry => <li className="cab-attention-row" key={entry.id}>
        <span className="cab-attention-icon" aria-hidden="true"><UiIcon name="clock" /></span>
        <span className="cab-attention-text"><strong>{name(entry.kind)} · {formatMinor(entry.amountMinor, "UZS", locale)}</strong><small>{formatDate(entry.createdAt)}</small></span>
        <button type="button" className="button ghost cab-attention-action" disabled={busy} onClick={() => void cancelRequest(entry.id)}>{w.cancel}</button>
      </li>)}</ul>
    </section>}

    {/* Two cards: money and TEC, each with its own actions. Side by side on a computer, stacked on a phone. */}
    <div className="cab-money-cards">
      <section className="panel-card cab-money-card" aria-labelledby="wallet-money">
        <h2 id="wallet-money" className="cab-h2">{w.moneyTitle}</h2>
        <strong className="cab-money-amount">{formatMinor(balanceMinor, "UZS", locale)}</strong>
        <div className="hero-actions">
          {paymentCard ? <button type="button" className="button" onClick={() => setDialog("topup")}>{w.topUp}</button>
            : <p className="small muted">{w.noCard} <Link className="text-link" href="/portal/messages">{w.write}</Link></p>}
          <button type="button" className="button ghost" onClick={() => setDialog("withdraw")} disabled={balanceMinor <= 0}>{w.withdraw}</button>
        </div>
      </section>
      <section className="panel-card cab-money-card is-tec" aria-labelledby="wallet-tec">
        <h2 id="wallet-tec" className="cab-h2">TEC</h2>
        <strong className="cab-money-amount">{formatNumber(points, 0)} TEC</strong>
        <div className="hero-actions">
          <Link className="button" href="/store">{w.buyTec}</Link>
          <button type="button" className="button ghost" aria-expanded={tecInfo} aria-controls="wallet-tec-info" onClick={() => setTecInfo(value => !value)}>{w.whatTec}</button>
        </div>
        {tecInfo && <div id="wallet-tec-info" className="small muted cab-tec-info"><p>{t("tecPurchaseDescription")}</p><p>{t("tecEarnRate")}</p></div>}
      </section>
    </div>

    <section className="panel-card" aria-labelledby="wallet-history">
      <h2 id="wallet-history">{w.history}</h2>
      <div className="cab-filters" role="group" aria-label={w.filterLabel}>
        {LEDGER_FILTERS.map(value => <button key={value} type="button" className={`shop-chip${filter === value ? " is-active" : ""}`} aria-pressed={filter === value} onClick={() => setFilter(value)}>{w.filters[value]}</button>)}
      </div>
      {shown.length === 0 ? <p className="muted">{w.empty}</p> : <ul className="list">{shown.map(entry => {
        const sign = ledgerSign(entry);
        return <li className="list-row cab-ledger-row" key={entry.id}>
          <span><strong>{name(entry.kind)}</strong><small className="muted"> · {formatDate(entry.createdAt)} · {statusWord(entry.status)}{entry.reference && entry.kind !== "WITHDRAWAL" ? ` · ${entry.reference}` : ""}</small></span>
          <strong className={`cab-ledger-amount${sign === "+" ? " is-in" : ""}`}>{sign}{formatMinor(entry.amountMinor, "UZS", locale)}</strong>
        </li>;
      })}</ul>}
    </section>

    {dialog === "topup" && paymentCard && <TopUpDialog card={paymentCard} start={startTopUp} onClose={done => { setDialog(null); if (done) { setNotice(w.sent); router.refresh(); } }} />}
    {dialog === "withdraw" && <WithdrawDialog available={withdrawable(balanceMinor, entries)} onClose={done => { setDialog(null); if (done) { setNotice(w.sent); router.refresh(); } }} />}
  </>;
}

async function postWallet(body: unknown): Promise<string | null> {
  const response = await fetch("/api/wallet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  if (response?.ok) return null;
  const data = await response?.json().catch(() => ({})) ?? {};
  return typeof data.error === "string" ? data.error : "";
}

/** Top-up in three steps: amount, the card to pay to (with a copy button), then the receipt. Going back keeps the amount. */
function TopUpDialog({ card, start, onClose }: { card: PaymentCard; start: number | null; onClose: (done: boolean) => void }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(start ? String(Math.ceil(start / 100)) : "");
  const [reference, setReference] = useState("");
  const [proof, setProof] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const amountMinor = parseSomInput(amount);
  async function send() {
    if (!amountMinor) { setStep(0); setError(w.badAmount); return; }
    if (reference.trim().length < 2) { setError(w.needReference); return; }
    if (!proof[0]) { setError(w.needProof); return; }
    setBusy(true); setError("");
    const failure = await postWallet({ kind: "DEPOSIT", amountMinor, reference: reference.trim(), proofMediaId: proof[0] });
    setBusy(false);
    if (failure !== null) { setError(failure ? translateMessage(failure, locale) : w.failed); return; }
    onClose(true);
  }
  return <SiteDialog className="site-dialog cab-dialog" title={w.topUp} onClose={() => { if (!busy) onClose(false); }}>
    <ol className="code-steps">{w.steps.map((label, index) => <li key={label} className={index === step ? "is-current" : index < step ? "is-done" : undefined} aria-current={index === step ? "step" : undefined}>{label}</li>)}</ol>
    <form className="form" onSubmit={event => {
      event.preventDefault();
      if (step === 0) { if (!amountMinor) { setError(w.badAmount); return; } setError(""); setStep(1); return; }
      if (step === 1) { setStep(2); return; }
      void send();
    }}>
      {step === 0 && <div className="field"><label htmlFor="topup-amount">{w.amount}</label><input id="topup-amount" inputMode="decimal" autoFocus required value={amount} onChange={event => setAmount(event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? "topup-error" : undefined} /></div>}
      {step === 1 && <>
        <p><strong>{amountMinor ? formatMinor(amountMinor, "UZS", locale) : ""}</strong> · {w.card}</p>
        <div className="pay-card">
          <span className="pay-card-bank">{card.bank || "Tecsecure"}</span>
          <strong className="pay-card-number">{card.number}</strong>
          <div className="pay-card-foot"><span>{card.holder}</span></div>
        </div>
        <button type="button" className="button ghost" onClick={() => { void navigator.clipboard?.writeText(card.number.replace(/\s/g, "")).then(() => setCopied(true)).catch(() => setCopied(false)); }}><UiIcon name="copy" size={16} /> {w.copy}</button>
        {copied && <span className="small muted" role="status">{w.copied}</span>}
      </>}
      {step === 2 && <>
        <div className="field"><label htmlFor="topup-reference">{w.reference}</label><input id="topup-reference" required minLength={2} maxLength={160} value={reference} onChange={event => setReference(event.target.value)} /></div>
        <span className="small">{w.proof}</span>
        <MediaUploader scope="WALLET" value={proof} onChange={setProof} hideLabel />
      </>}
      {error && <p className="notice error" role="alert" id="topup-error">{error}</p>}
      <div className="hero-actions">
        {step > 0 && <button type="button" className="button ghost" disabled={busy} onClick={() => { setError(""); setStep(step - 1); }}>{w.back}</button>}
        <button type="submit" className="button" disabled={busy || (step === 2 && !proof[0])}>{step < 2 ? w.next : busy ? w.sending : w.send}</button>
      </div>
    </form>
  </SiteDialog>;
}

function WithdrawDialog({ available, onClose }: { available: number; onClose: (done: boolean) => void }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function send() {
    const amountMinor = parseSomInput(amount);
    if (!amountMinor) { setError(w.badAmount); return; }
    if (amountMinor > available) { setError(w.overAvailable); return; }
    setBusy(true); setError("");
    const failure = await postWallet({ kind: "WITHDRAWAL", amountMinor, details: details.trim() });
    setBusy(false);
    if (failure !== null) { setError(failure ? translateMessage(failure, locale) : w.failed); return; }
    onClose(true);
  }
  return <SiteDialog className="site-dialog cab-dialog" title={w.withdraw} onClose={() => { if (!busy) onClose(false); }}>
    <form className="form" onSubmit={event => { event.preventDefault(); void send(); }}>
      <p>{w.available(formatMinor(available, "UZS", locale))}</p>
      <div className="field"><label htmlFor="withdraw-amount">{w.amount}</label><input id="withdraw-amount" inputMode="decimal" required value={amount} onChange={event => setAmount(event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? "withdraw-error" : undefined} /></div>
      <div className="field"><label htmlFor="withdraw-details">{w.details}</label><textarea id="withdraw-details" required minLength={10} maxLength={2000} rows={3} value={details} onChange={event => setDetails(event.target.value)} aria-describedby="withdraw-hint" /><small id="withdraw-hint" className="muted">{w.detailsHint}</small></div>
      {error && <p className="notice error" role="alert" id="withdraw-error">{error}</p>}
      <div className="hero-actions">
        <button type="submit" className="button" disabled={busy}>{busy ? w.sending : w.send}</button>
        <button type="button" className="button ghost" disabled={busy} onClick={() => onClose(false)}>{w.close}</button>
      </div>
    </form>
  </SiteDialog>;
}
