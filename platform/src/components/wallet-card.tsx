"use client";

import { useId, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { featureCopy } from "@/lib/feature-copy";

export function WalletCard({ balance, points, rank }: { balance: number; points: number; rank: string }) {
  const { locale, t } = useSitePreferences();
  const c = featureCopy[locale];
  const [flipped, setFlipped] = useState(false);
  const id = useId();
  // Uzbek ICU support differs between Node and browsers; use the same space/comma format.
  const numberLocale = locale === "en" ? "en-US" : "ru-RU";
  return <div className="feature-wallet">
    <div className="feature-wallet-stage" id={id} data-flipped={flipped}>
      <div className="feature-wallet-rotor">
        <div className="feature-wallet-face feature-wallet-front" aria-hidden={flipped} inert={flipped}>
          <div className="feature-wallet-heading"><strong>Tecsecure</strong><span>{t("wallet")}</span></div>
          <span className="feature-wallet-chip" aria-hidden="true" />
          <span>{t("walletBalance")}</span>
          <strong className="feature-wallet-amount">{(balance / 100).toLocaleString(numberLocale)} UZS</strong>
          <small>{c.walletNote}</small>
        </div>
        <div className="feature-wallet-face feature-wallet-back" aria-hidden={!flipped} inert={!flipped}>
          <strong>Tecsecure</strong>
          <span>{t("rewardPoints")}</span><strong className="feature-wallet-amount">{points.toLocaleString(numberLocale)}</strong>
          <span>{t("rewardRank")}: <strong>{rank}</strong></span>
          <small>{c.walletNote}</small>
        </div>
      </div>
    </div>
    <button className="button secondary" type="button" aria-controls={id} aria-pressed={flipped} onClick={() => setFlipped(value => !value)}>{flipped ? c.walletFront : c.walletDetails}</button>
  </div>;
}
