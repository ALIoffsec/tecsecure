"use client";

import { useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { featureCopy } from "@/lib/feature-copy";
import { formatNumber } from "@/lib/format";

/** The supplied flip card, on real wallet data. It deliberately shows no card number: this is not a bank card. */
export function WalletCard({ balance, points, rank }: { balance: number; points: number; rank: string }) {
  const { locale, t } = useSitePreferences();
  const c = featureCopy[locale];
  const [flipped, setFlipped] = useState(false);
  const flip = () => setFlipped(value => !value);
  return <div className="feature-wallet">
    <div className="feature-wallet-stage" data-flipped={flipped}>
      <div className="feature-wallet-rotor">
        <div className="feature-wallet-face feature-wallet-front" aria-hidden={flipped} inert={flipped}>
          <i className="feature-wallet-reflection" aria-hidden="true" />
          <span className="feature-wallet-type">{rank}</span>
          <strong className="feature-wallet-title">Tecsecure</strong>
          <div className="feature-wallet-details">
            <span>{t("walletBalance")}</span>
            <strong className="feature-wallet-amount">{formatNumber(balance / 100)} UZS</strong>
          </div>
          <button className="feature-wallet-flip" type="button" onClick={flip}>{c.walletDetails}</button>
          <i className="feature-wallet-logo" aria-hidden="true" />
        </div>
        <div className="feature-wallet-face feature-wallet-back" aria-hidden={!flipped} inert={!flipped}>
          <i className="feature-wallet-reflection" aria-hidden="true" />
          <span className="feature-wallet-chip" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <strong className="feature-wallet-title">Tecsecure</strong>
          <div className="feature-wallet-details">
            <span>{t("rewardPoints")}</span>
            <strong className="feature-wallet-amount">{formatNumber(points)}</strong>
            <span>{t("rewardRank")}: <strong>{rank}</strong></span>
          </div>
          <button className="feature-wallet-flip" type="button" onClick={flip}>{c.walletFront}</button>
          <i className="feature-wallet-logo" aria-hidden="true" />
        </div>
      </div>
    </div>
    <small className="feature-wallet-note">{c.walletNote}</small>
  </div>;
}
