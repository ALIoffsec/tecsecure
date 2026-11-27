"use client";

import { useSitePreferences } from "@/components/site-preferences";
import { OrganizationSetupForm } from "@/components/organization-setup-form";
import { DeviceRegisterForm } from "@/components/device-register-form";
import { SubscriptionManager } from "@/components/subscription-manager";
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
export function CabinetTitle({ section }: { section: Exclude<keyof typeof cabinetLabels.uz, "groups"> }) {
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
