"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CoinStack, PlanArt } from "@/components/store-art";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import { learningSubscriptionPlans } from "@/lib/learning-subscriptions";
import { tecPacks, tecPurchaseCostMinor, TEC_PRICE_UZS } from "@/lib/tec-pricing";

type Subscription = { planKey: string; endsAt: string; active: boolean } | null;
type Celebration = { kind: "tec" | "plan"; title: string };

const celebrationCopy = {
  uz: { tec: "Tabriklaymiz!", plan: "Yo'lingiz ochildi!", tecLine: "TEC hisobingizga qo'shildi", planLine: "reja 30 kunga faollashdi", quote: "Katta mahorat har kuni qilingan kichik mashqdan boshlanadi.", cta: "O'qishni boshlash", close: "Yopish" },
  ru: { tec: "Поздравляем!", plan: "Путь открыт!", tecLine: "TEC зачислены на ваш счёт", planLine: "план активирован на 30 дней", quote: "Большое мастерство начинается с маленькой практики каждый день.", cta: "Начать учиться", close: "Закрыть" },
  en: { tec: "Congratulations!", plan: "Your path is open!", tecLine: "TEC added to your account", planLine: "plan active for 30 days", quote: "Great skill starts with small practice, every single day.", cta: "Start learning", close: "Close" }
};

const confetti = Array.from({ length: 28 }, (_, i) => ({ left: (i * 37) % 100, delay: (i % 7) * 0.12, hue: (i * 47) % 360, dur: 2.2 + (i % 5) * 0.3 }));

function CelebrationModal({ data, locale, onClose }: { data: Celebration; locale: "uz" | "ru" | "en"; onClose: () => void }) {
  const t = celebrationCopy[locale];
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <div className="celebrate-backdrop" role="dialog" aria-modal="true" aria-label={t[data.kind]} onClick={onClose}>
    <div className="celebrate-card" onClick={(event) => event.stopPropagation()}>
      <div className="celebrate-confetti" aria-hidden="true">
        {confetti.map((piece, i) => <i key={i} style={{ left: `${piece.left}%`, animationDelay: `${piece.delay}s`, animationDuration: `${piece.dur}s`, background: `hsl(${piece.hue} 85% 62%)` }} />)}
      </div>
      <div className="celebrate-medal" aria-hidden="true"><span>{data.kind === "tec" ? "T" : "★"}</span></div>
      <h2>{t[data.kind]}</h2>
      <strong className="celebrate-title">{data.title}</strong>
      <p>{data.kind === "tec" ? t.tecLine : t.planLine}</p>
      <blockquote>{t.quote}</blockquote>
      <div className="celebrate-actions">
        {data.kind === "plan" && <Link href="/learning" className="button">{t.cta}</Link>}
        <button type="button" className="button secondary" onClick={onClose} autoFocus>{t.close}</button>
      </div>
    </div>
  </div>;
}

const copy = {
  uz: { title: "Tecsecure do'koni", intro: "TEC paketlari va ta'lim obunalari. Narx har bir blokda ko'rsatilgan.", balance: "Hamyon", topUp: "Hamyonni to'ldirish", tecTitle: "TEC paketlari", tecNote: "1 TEC = 4 990 UZS. Kattaroq paketlarda chegirma.", buy: "Sotib olish", off: "chegirma", save: "tejaysiz", subTitle: "Oylik ta'lim obunalari", subNote: "30 kunlik kirish, avtomatik yechilmaydi. Tanlangan reja darhol kuchga kiradi.", month: "30 kun", modules: "modul", active: "Faol reja", until: "gacha", noFunds: "Hamyonda mablag' yetarli emas", ok: "TEC hisobingizga qo'shildi.", planOk: "Reja faollashtirildi.", fail: "Amal bajarilmadi.", descriptions: ["Asosiy tarmoq, Linux, Windows va kiberxavfsizlik", "Asos va amaliy mavzular, 8 modul", "Hozirgi katalogdagi barcha modullar"], disclaimer: "Obuna ta'lim materiallariga kirishni beradi; ish yoki sertifikat kafolati emas." },
  ru: { title: "Магазин Tecsecure", intro: "Пакеты TEC и обучающие подписки. Цена указана в каждом блоке.", balance: "Кошелёк", topUp: "Пополнить кошелёк", tecTitle: "Пакеты TEC", tecNote: "1 TEC = 4 990 UZS. Скидки на крупные пакеты.", buy: "Купить", off: "скидка", save: "экономия", subTitle: "Месячные подписки на обучение", subNote: "Доступ на 30 дней без автосписания. Выбранный план действует сразу.", month: "30 дней", modules: "мод.", active: "Активный план", until: "до", noFunds: "Недостаточно средств на кошельке", ok: "TEC зачислены на ваш счёт.", planOk: "План активирован.", fail: "Не удалось выполнить действие.", descriptions: ["Основы сетей, Linux, Windows и кибербезопасности", "Основы и практика, 8 модулей", "Все модули текущего каталога"], disclaimer: "Подписка даёт доступ к материалам; это не гарантия работы или сертификат." },
  en: { title: "Tecsecure Store", intro: "TEC packs and learning subscriptions. Each price is shown on its card.", balance: "Wallet", topUp: "Top up wallet", tecTitle: "TEC packs", tecNote: "1 TEC = 4,990 UZS. Bigger packs are discounted.", buy: "Buy", off: "off", save: "you save", subTitle: "Monthly learning plans", subNote: "30 days of access, no automatic charge. A newly chosen plan applies immediately.", month: "30 days", modules: "modules", active: "Active plan", until: "until", noFunds: "Not enough wallet balance", ok: "TEC added to your account.", planOk: "Plan activated.", fail: "Action failed.", descriptions: ["Core networking, Linux, Windows and security", "Foundations plus practice, 8 modules", "Every module in the current catalog"], disclaimer: "A plan unlocks learning material; it is not a job or certificate guarantee." }
};

const money = (value: number) => Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const perkText: Record<string, string> = {
  basic: "Laboratoriya va imtihonlar TEC bilan alohida olinadi.",
  standard: "Laboratoriyalarga 25% chegirma.",
  expert: "Laboratoriyalar bepul, imtihonlarga 50% chegirma."
};

export function StoreView({ walletBalanceMinor, moduleCount }: { walletBalanceMinor: number; moduleCount: number }) {
  const router = useRouter();
  const { locale } = useSitePreferences();
  const c = copy[locale];
  const nf = locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US";
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  useEffect(() => {
    fetch("/api/learning/subscription").then((r) => r.json()).then((d) => setSubscription(d.subscription ?? null)).catch(() => undefined);
  }, []);

  async function post(url: string, body: object, key: string, success: Celebration, onDone?: (result: { subscription?: Subscription }) => void) {
    setBusy(key); setError(""); setCelebration(null);
    try {
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? c.fail);
      onDone?.(result);
      setCelebration(success);
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : c.fail);
    } finally {
      setBusy("");
    }
  }

  const activePlan = subscription?.active ? subscription.planKey : null;
  return <div className="container page-shell store-page">
    <section className="store-head">
      <div><span className="eyebrow">TEC</span><h1 className="page-title">{c.title}</h1><p className="page-intro">{c.intro}</p></div>
      <div className="store-wallet"><span>{c.balance}</span><strong>{money(walletBalanceMinor / 100)} UZS</strong><Link href="/portal/profile" className="small">{c.topUp}</Link></div>
    </section>
    <ToastMessage message={error} variant="error" />
    {celebration && <CelebrationModal data={celebration} locale={locale} onClose={() => setCelebration(null)} />}

    <h2>{c.tecTitle}</h2>
    <p className="small muted">{c.tecNote}</p>
    <p className="small muted">TEC ni modullar, <Link href="/learning/practice">laboratoriyalar va imtihonlar</Link> uchun sarflaysiz (Uzbek tilida).</p>
    <div className="store-grid">
      {tecPacks.map((pack, index) => {
        const cost = tecPurchaseCostMinor(pack.amountTec, pack.discountPercent);
        const list = pack.amountTec * TEC_PRICE_UZS * 100;
        const affordable = walletBalanceMinor >= cost;
        return <article className={`store-card ${pack.discountPercent ? "has-deal" : ""}`} key={pack.id}>
          {pack.discountPercent > 0 && <span className="store-ribbon">−{pack.discountPercent}%</span>}
          <CoinStack tier={index - 2} />
          <h3>{pack.amountTec} TEC</h3>
          <div className="store-price">
            <strong>{money(cost / 100)} UZS</strong>
            {pack.discountPercent > 0 && <s>{money(list / 100)}</s>}
          </div>
          {pack.discountPercent > 0 && <small className="store-save">{c.save} {money((list - cost) / 100)} UZS</small>}
          <button className="button" type="button" disabled={Boolean(busy) || !affordable} onClick={() => post("/api/wallet/tec-purchase", { packId: pack.id }, pack.id, { kind: "tec", title: `+${pack.amountTec} TEC` })}>
            {busy === pack.id ? "…" : c.buy}
          </button>
          {!affordable && <small className="muted">{c.noFunds}</small>}
        </article>;
      })}
    </div>

    <h2>{c.subTitle}</h2>
    <p className="small muted">{c.subNote}</p>
    {activePlan && subscription && <p className="notice success">{c.active}: <strong>{learningSubscriptionPlans.find((p) => p.key === activePlan)?.name}</strong> · {c.until} {new Date(subscription.endsAt).toLocaleDateString(nf)}</p>}
    <div className="store-grid store-plans">
      {learningSubscriptionPlans.map((plan, index) => {
        const count = plan.modules === "all" ? moduleCount : plan.modules.length;
        const affordable = walletBalanceMinor >= plan.priceMinor;
        return <article className={`store-card plan-${plan.key} ${activePlan === plan.key ? "is-active" : ""}`} key={plan.key}>
          {plan.key === "standard" && <span className="store-ribbon">★</span>}
          <PlanArt plan={plan.key} />
          <h3>{plan.name}</h3>
          <p className="small muted">{c.descriptions[index]}</p>
          <p className="small">{count} {c.modules} · ≈ {money(Math.round(plan.priceMinor / 100 / count))} UZS / {c.modules}</p>
          <p className="small store-perk">{perkText[plan.key]}</p>
          <div className="store-price"><strong>{money(plan.priceMinor / 100)} UZS</strong><small>/ {c.month}</small></div>
          <button className="button" type="button" disabled={Boolean(busy) || !affordable} onClick={() => post("/api/learning/subscription", { planKey: plan.key }, plan.key, { kind: "plan", title: plan.name }, (r) => r.subscription && setSubscription({ ...r.subscription, active: true }))}>
            {busy === plan.key ? "…" : c.buy}
          </button>
          {!affordable && <small className="muted">{c.noFunds}</small>}
        </article>;
      })}
    </div>
    <p className="small muted">{c.disclaimer}</p>
  </div>;
}
