"use client";

import { FormEvent, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";

type Estimate = {
  preliminary: boolean;
  assumptions: string[];
  cameraCount: number;
  nvrChannels: number;
  estimatedStorageTB: number;
  recordingBandwidthMbps: number;
  poeSwitches24Port: number;
  poeBudgetWatts: number;
  cableEstimate: null;
  needsTechnicalReview: boolean;
};

export function CctvBuilder() {
  const { locale, t } = useSitePreferences();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [bitrateUsed, setBitrateUsed] = useState(4);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const payload = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Number(value)]));
    try {
      const response = await fetch("/api/solution-builder/cctv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? t("requestFailed"));
        return;
      }
      setBitrateUsed(Number(raw.bitrateMbps) || 4);
      setEstimate(data as Estimate);
    } catch {
      setError(t("serverUnavailable"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="two-col">
      <div>
        <p className="muted">{t("cctvDisclaimer")}</p>
        <form className="form" onSubmit={submit}>
          <div className="form-row">
            <div className="field"><label htmlFor="cameraCount">{t("cameraCount")}</label><input id="cameraCount" name="cameraCount" type="number" min="1" max="256" defaultValue="8" required /></div>
            <div className="field"><label htmlFor="cameraCountGrowth">{t("futureExpansion")}</label><input id="cameraCountGrowth" name="cameraCountGrowth" type="number" min="0" max="128" defaultValue="2" required /></div>
          </div>
          <div className="form-row">
            <div className="field"><label htmlFor="retentionDays">{t("retentionDays")}</label><input id="retentionDays" name="retentionDays" type="number" min="1" max="365" defaultValue="30" required /></div>
            <div className="field"><label htmlFor="recordingHoursPerDay">{t("recordingHours")}</label><input id="recordingHoursPerDay" name="recordingHoursPerDay" type="number" min="1" max="24" defaultValue="24" required /></div>
          </div>
          <div className="form-row">
            <div className="field"><label htmlFor="bitrateMbps">{t("cameraBitrate")}</label><input id="bitrateMbps" name="bitrateMbps" type="number" min="0.1" max="32" step="0.1" defaultValue="4" required /></div>
            <div className="field"><label htmlFor="poeWattsPerCamera">{t("poePower")}</label><input id="poeWattsPerCamera" name="poeWattsPerCamera" type="number" min="1" max="90" defaultValue="12" required /></div>
          </div>
          <ToastMessage message={error} variant="error" />
          <button className="button" type="submit" disabled={busy}>{busy ? t("calculating") : t("preliminaryEstimate")}</button>
        </form>
      </div>
      <div className="panel-card builder-result" aria-live="polite">
        <h3>{t("result")}</h3>
        {!estimate ? <p className="muted">{t("enterParameters")}</p> : <>
          <div className="list">
            <div className="list-row"><span>{t("cameras")}</span><strong>{estimate.cameraCount}</strong></div>
            <div className="list-row"><span>{t("nvrCapacity")}</span><strong>{estimate.nvrChannels} {locale === "uz" ? "kanal" : locale === "ru" ? "каналов" : "channels"}</strong></div>
            <div className="list-row"><span>{t("storageHeadroom")}</span><strong>{estimate.estimatedStorageTB} TB</strong></div>
            <div className="list-row"><span>{t("estimatedBandwidth")}</span><strong>{estimate.recordingBandwidthMbps} Mbps</strong></div>
            <div className="list-row"><span>{t("poeSwitch")}</span><strong>{estimate.poeSwitches24Port}</strong></div>
            <div className="list-row"><span>{t("poeBudget")}</span><strong>{estimate.poeBudgetWatts} W</strong></div>
          </div>
          <p className="notice">{t("technicalReviewDisclaimer")}</p>
          <ul className="small muted">
            <li>{t("cctvAssumptionBitrate").replace("{value}", String(bitrateUsed))}</li>
            <li>{t("cctvAssumptionStorage")}</li>
            <li>{t("cctvAssumptionCable")}</li>
          </ul>
        </>}
      </div>
    </div>
  );
}
