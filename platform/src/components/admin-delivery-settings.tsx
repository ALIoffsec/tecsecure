"use client";

import { useEffect, useState } from "react";
import { ToastMessage } from "./toast-provider";
import { useSitePreferences } from "./site-preferences";
import { deliveryAdminCopy } from "@/lib/delivery-copy";
import { emptyTariffs, regionCodes, regionNames, type DeliveryTariffs, type RegionCode, type RegionTariff } from "@/lib/delivery";

const blankRow: RegionTariff = { express: null, expressDays: [0, 1], courier: null, courierDays: [1, 3] };
const presets = ["0-0", "0-1", "1-1", "1-2", "1-3", "2-3", "2-4", "3-5", "5-7", "7-14"];
const toKey = ([min, max]: [number, number]) => `${min}-${max}`;
const fromKey = (key: string) => key.split("-").map(Number) as [number, number];

/** Whole so'm as typed ("25 000" works too); empty means "not offered". */
function readPrice(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  return digits ? Math.min(Number(digits), 100_000_000) : null;
}

/** Admin → Company: what delivery costs in each region, pickup, free-delivery threshold and VAT. */
export function AdminDeliverySettings() {
  const { locale } = useSitePreferences();
  const c = deliveryAdminCopy[locale];
  const [tariffs, setTariffs] = useState<DeliveryTariffs>(emptyTariffs);
  const [vat, setVat] = useState<"NONE" | "INCLUDED">("NONE");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/admin/delivery", { cache: "no-store" }).then(response => response.ok ? response.json() : Promise.reject(new Error()))
      .then((data: { tariffs: DeliveryTariffs; vat: "NONE" | "INCLUDED" }) => { setTariffs(data.tariffs); setVat(data.vat); setLoaded(true); })
      .catch(() => setError(c.failed));
  }, [c.failed]);

  const row = (code: RegionCode) => tariffs.regions[code] ?? blankRow;
  const patchRow = (code: RegionCode, patch: Partial<RegionTariff>) =>
    setTariffs(current => ({ ...current, regions: { ...current.regions, [code]: { ...(current.regions[code] ?? blankRow), ...patch } } }));
  const copyFirstRow = () => {
    const first = row(regionCodes[1]);
    setTariffs(current => ({ ...current, regions: Object.fromEntries(regionCodes.map(code => [code, code === "TASHKENT_CITY" ? current.regions[code] ?? blankRow : { ...first }])) }));
  };

  async function save() {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/delivery", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tariffs, vat }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? c.failed);
      setTariffs(data.tariffs); setVat(data.vat);
      setNotice(c.saved);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : c.failed);
    } finally {
      setBusy(false);
    }
  }

  return <details className="admin-records-accordion admin-delivery">
    <summary>{c.title}</summary>
    <div className="stack">
      <p className="small muted">{c.hint}</p>
      <ToastMessage message={error} variant="error" />
      <ToastMessage message={notice} variant="success" />
      {loaded && <>
        <div className="admin-delivery-table" role="table" aria-label={c.title}>
          <div className="admin-delivery-row admin-delivery-head" role="row">
            <span role="columnheader">{c.region}</span><span role="columnheader">{c.express}</span><span role="columnheader">{c.days}</span><span role="columnheader">{c.courier}</span><span role="columnheader">{c.days}</span>
          </div>
          {regionCodes.map(code => {
            const value = row(code);
            const name = regionNames[locale][code];
            return <div className="admin-delivery-row" role="row" key={code}>
              <strong role="rowheader">{name}</strong>
              <input role="cell" inputMode="numeric" aria-label={`${name}: ${c.express}`} value={value.express ?? ""} onChange={event => patchRow(code, { express: readPrice(event.target.value) })} placeholder="—" />
              <select role="cell" aria-label={`${name}: ${c.express}, ${c.days}`} value={toKey(value.expressDays)} onChange={event => patchRow(code, { expressDays: fromKey(event.target.value) })}>
                {presets.map(key => <option key={key} value={key}>{c.daysPresets[key]}</option>)}
              </select>
              <input role="cell" inputMode="numeric" aria-label={`${name}: ${c.courier}`} value={value.courier ?? ""} onChange={event => patchRow(code, { courier: readPrice(event.target.value) })} placeholder="—" />
              <select role="cell" aria-label={`${name}: ${c.courier}, ${c.days}`} value={toKey(value.courierDays)} onChange={event => patchRow(code, { courierDays: fromKey(event.target.value) })}>
                {presets.map(key => <option key={key} value={key}>{c.daysPresets[key]}</option>)}
              </select>
            </div>;
          })}
        </div>
        <div className="admin-integration-actions">
          <button className="button secondary small" type="button" onClick={copyFirstRow}>{c.copyDown}</button>
          <span className="small muted">{c.fillHint}</span>
        </div>
        <h3>{c.pickup}</h3>
        <label className="admin-integration-clear"><input type="checkbox" checked={tariffs.pickup.enabled} onChange={event => setTariffs(current => ({ ...current, pickup: { ...current.pickup, enabled: event.target.checked } }))} /> {c.pickupOn}</label>
        <div className="field"><label htmlFor="delivery-pickup-address">{c.pickupAddress}</label>
          <input id="delivery-pickup-address" value={tariffs.pickup.address} maxLength={300} onChange={event => setTariffs(current => ({ ...current, pickup: { ...current.pickup, address: event.target.value } }))} />
        </div>
        <div className="field"><label htmlFor="delivery-free-from">{c.freeFrom}</label>
          <input id="delivery-free-from" inputMode="numeric" value={tariffs.freeFrom ?? ""} onChange={event => setTariffs(current => ({ ...current, freeFrom: readPrice(event.target.value) }))} placeholder="—" />
        </div>
        <h3>{c.vat}</h3>
        <div className="stack" role="radiogroup" aria-label={c.vat}>
          <label className="admin-integration-clear"><input type="radio" name="vat" checked={vat === "NONE"} onChange={() => setVat("NONE")} /> {c.vatNone}</label>
          <label className="admin-integration-clear"><input type="radio" name="vat" checked={vat === "INCLUDED"} onChange={() => setVat("INCLUDED")} /> {c.vatIncluded}</label>
          <p className="small muted">{c.vatHint}</p>
        </div>
        <div><button className="button" type="button" disabled={busy} onClick={() => void save()}>{c.save}</button></div>
      </>}
    </div>
  </details>;
}
