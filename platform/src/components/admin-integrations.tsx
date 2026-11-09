"use client";

import { siteCopy } from "@/lib/site-copy";
import { growthCopy } from "@/lib/growth-copy";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ToastMessage } from "@/components/toast-provider";
import { useSitePreferences } from "@/components/site-preferences";
import type { OAuthProviderId } from "@/lib/integration-credentials";
import { otpSmsText } from "@/lib/otp-text";

type IntegrationStatus = {
  sms: { eskizEmail: string; eskizFrom: string; hasPassword: boolean; configured: boolean };
  telegram: {
    botUsername: string;
    adminChatId: string;
    hasBotToken: boolean;
    hasWebhookSecret: boolean;
    staffBotUsername: string;
    hasStaffBotToken: boolean;
    hasStaffWebhookSecret: boolean;
  };
  yandexMaps: { configured: boolean };
  oauth: Record<OAuthProviderId, {
    clientId: string;
    tenantId?: string;
    hasClientSecret: boolean;
    configured: boolean;
  }>;
};

const oauthProviders: { id: OAuthProviderId; label: "oauthGoogle" | "oauthGithub" | "oauthYandex" | "oauthMicrosoft" }[] = [
  { id: "google", label: "oauthGoogle" },
  { id: "github", label: "oauthGithub" },
  { id: "yandex", label: "oauthYandex" },
  { id: "microsoft", label: "oauthMicrosoft" }
];

function fieldValue(data: FormData, name: string): string {
  return String(data.get(name) ?? "");
}

function checked(data: FormData, name: string): boolean {
  return data.get(name) === "on";
}

export function AdminIntegrations() {
  const { t, locale } = useSitePreferences();
  const bot = siteCopy[locale].admin;
  const staffBot = growthCopy[locale].integrations;
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [formVersion, setFormVersion] = useState(0);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/integrations", { cache: "no-store" });
      const result = await response.json() as { integrations?: IntegrationStatus; error?: string };
      if (!response.ok || !result.integrations) throw new Error(result.error ?? t("integrationLoadFailed"));
      setStatus(result.integrations);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("integrationLoadFailed"));
    }
  }, [t]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function save(event: FormEvent<HTMLFormElement>, body: (data: FormData) => object) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body(new FormData(event.currentTarget)))
      });
      const result = await response.json() as { integrations?: IntegrationStatus; error?: string };
      if (!response.ok || !result.integrations) throw new Error(result.error ?? t("requestFailed"));
      setStatus(result.integrations);
      setFormVersion((version) => version + 1);
      setNotice(t("integrationSaved"));
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }

  const statusLabel = (configured: boolean) => configured ? t("integrationConfigured") : t("integrationNotConfigured");
  const secretPlaceholder = (saved: boolean) => saved ? t("secretAlreadySet") : t("secretNotSet");

  async function testSms(phone: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "sms", phone })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setNotice(staffBot.smsTestSent);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function testBot() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/integrations/test", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? bot.botTestFailed);
      setNotice(`${bot.botTestSent} ${result.webhook === "connected" ? bot.botWebhookOn : result.webhook === "needs-secret" ? bot.botWebhookSecret : bot.botWebhookLocal}`);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : bot.botTestFailed);
    } finally {
      setBusy(false);
    }
  }

  return <section className="panel-card admin-integrations">
    <div className="section-head">
      <div><h2>{t("integrationsTitle")}</h2><p className="small muted">{t("integrationsDescription")}</p></div>
      <button className="button secondary small" type="button" onClick={() => void refresh()} disabled={busy}>{t("refresh")}</button>
    </div>
    <ToastMessage message={error} variant="error" />
    <ToastMessage message={notice} variant="success" />
    <p className="small muted">{t("integrationsEncryptionNotice")}</p>

    {!status ? <p className="small muted" aria-live="polite">{error || t("loading")}</p> : <>
      <details className="admin-records-accordion" open={!status.sms.configured}>
        <summary>{staffBot.smsTitle} · {statusLabel(status.sms.configured)}</summary>
        <form className="form admin-integration-form" key={`sms-${formVersion}`} onSubmit={(event) => void save(event, (data) => ({
          sms: {
            eskizEmail: fieldValue(data, "eskizEmail"),
            eskizPassword: fieldValue(data, "eskizPassword"),
            eskizFrom: fieldValue(data, "eskizFrom"),
            clearEskizEmail: checked(data, "clearEskizEmail"),
            clearEskizPassword: checked(data, "clearEskizPassword")
          }
        }))}>
          <p className="small muted">{staffBot.smsHint}</p>
          <div className="form-row">
            <div className="field">
              <label htmlFor="eskiz-email">{staffBot.smsEmail}</label>
              <input id="eskiz-email" name="eskizEmail" type="email" defaultValue={status.sms.eskizEmail} maxLength={254} autoComplete="off" />
              {status.sms.eskizEmail && <label className="admin-integration-clear"><input type="checkbox" name="clearEskizEmail" /> {t("clearCurrentValue")}</label>}
            </div>
            <div className="field">
              <label htmlFor="eskiz-password">{staffBot.smsPassword}</label>
              <input id="eskiz-password" name="eskizPassword" type="password" autoComplete="new-password" maxLength={512} placeholder={secretPlaceholder(status.sms.hasPassword)} />
              {status.sms.hasPassword && <label className="admin-integration-clear"><input type="checkbox" name="clearEskizPassword" /> {t("clearCurrentValue")}</label>}
            </div>
          </div>
          <div className="field">
            <label htmlFor="eskiz-from">{staffBot.smsFrom}</label>
            <input id="eskiz-from" name="eskizFrom" defaultValue={status.sms.eskizFrom} maxLength={32} placeholder="4546" />
            <small className="muted">{staffBot.smsFromHint}</small>
          </div>
          <p className="small muted">{staffBot.smsTemplates}</p>
          <pre className="admin-sms-template">{otpSmsText("LOGIN", "123456")}</pre>
          <pre className="admin-sms-template">{otpSmsText("RESET", "123456")}</pre>
          <div className="field">
            <label htmlFor="eskiz-test-phone">{staffBot.smsTestPhone}</label>
            <input id="eskiz-test-phone" name="testPhone" inputMode="tel" autoComplete="off" placeholder="+998 90 123 45 67" />
          </div>
          <div className="admin-integration-actions">
            <button className="button" disabled={busy}>{busy ? t("saving") : t("saveIntegration")}</button>
            <button className="button secondary" type="button" disabled={busy || !status.sms.configured} onClick={(event) => void testSms(String(new FormData(event.currentTarget.form ?? undefined).get("testPhone") ?? ""))}>{staffBot.smsTest}</button>
          </div>
        </form>
      </details>

      <details className="admin-records-accordion" open={status.sms.configured}>
        <summary>{t("telegramIntegration")} · {statusLabel(
          status.telegram.hasBotToken && status.telegram.hasWebhookSecret &&
          Boolean(status.telegram.botUsername && status.telegram.adminChatId)
        )}</summary>
        <form className="form admin-integration-form" key={`telegram-${formVersion}`} onSubmit={(event) => void save(event, (data) => ({
          telegram: {
            botToken: fieldValue(data, "botToken"),
            botUsername: fieldValue(data, "botUsername"),
            adminChatId: fieldValue(data, "adminChatId"),
            webhookSecret: fieldValue(data, "webhookSecret"),
            clearBotToken: checked(data, "clearBotToken"),
            clearBotUsername: checked(data, "clearBotUsername"),
            clearAdminChatId: checked(data, "clearAdminChatId"),
            clearWebhookSecret: checked(data, "clearWebhookSecret"),
            staffBotToken: fieldValue(data, "staffBotToken"),
            staffBotUsername: fieldValue(data, "staffBotUsername"),
            staffWebhookSecret: fieldValue(data, "staffWebhookSecret"),
            clearStaffBotToken: checked(data, "clearStaffBotToken"),
            clearStaffBotUsername: checked(data, "clearStaffBotUsername"),
            clearStaffWebhookSecret: checked(data, "clearStaffWebhookSecret")
          }
        }))}>
          <div className="field">
            <label>{t("telegramBotToken")}</label>
            <input name="botToken" type="password" autoComplete="new-password" placeholder={secretPlaceholder(status.telegram.hasBotToken)} />
            {status.telegram.hasBotToken && <label className="admin-integration-clear"><input type="checkbox" name="clearBotToken" /> {t("clearCurrentValue")}</label>}
          </div>
          <div className="form-row">
            <div className="field">
              <label>{t("telegramBotUsername")}</label>
              <input name="botUsername" defaultValue={status.telegram.botUsername} maxLength={100} placeholder="@botname" />
              {status.telegram.botUsername && <label className="admin-integration-clear"><input type="checkbox" name="clearBotUsername" /> {t("clearCurrentValue")}</label>}
            </div>
            <div className="field">
              <label>{t("telegramAdminChatId")}</label>
              <input name="adminChatId" defaultValue={status.telegram.adminChatId} maxLength={100} />
              {status.telegram.adminChatId && <label className="admin-integration-clear"><input type="checkbox" name="clearAdminChatId" /> {t("clearCurrentValue")}</label>}
            </div>
          </div>
          <div className="field">
            <label>{t("telegramWebhookSecret")}</label>
            <input name="webhookSecret" type="password" autoComplete="new-password" placeholder={secretPlaceholder(status.telegram.hasWebhookSecret)} />
            {status.telegram.hasWebhookSecret && <label className="admin-integration-clear"><input type="checkbox" name="clearWebhookSecret" /> {t("clearCurrentValue")}</label>}
          </div>
          <h3>{staffBot.staffBot}</h3>
          <p className="small muted">{staffBot.staffHint}</p>
          <div className="field">
            <label>{staffBot.staffToken}</label>
            <input name="staffBotToken" type="password" autoComplete="new-password" placeholder={secretPlaceholder(status.telegram.hasStaffBotToken)} />
            {status.telegram.hasStaffBotToken && <label className="admin-integration-clear"><input type="checkbox" name="clearStaffBotToken" /> {t("clearCurrentValue")}</label>}
          </div>
          <div className="form-row">
            <div className="field">
              <label>{staffBot.staffUsername}</label>
              <input name="staffBotUsername" defaultValue={status.telegram.staffBotUsername} maxLength={100} placeholder="@botname" />
              {status.telegram.staffBotUsername && <label className="admin-integration-clear"><input type="checkbox" name="clearStaffBotUsername" /> {t("clearCurrentValue")}</label>}
            </div>
            <div className="field">
              <label>{staffBot.staffSecret}</label>
              <input name="staffWebhookSecret" type="password" autoComplete="new-password" placeholder={secretPlaceholder(status.telegram.hasStaffWebhookSecret)} />
              {status.telegram.hasStaffWebhookSecret && <label className="admin-integration-clear"><input type="checkbox" name="clearStaffWebhookSecret" /> {t("clearCurrentValue")}</label>}
            </div>
          </div>
          <div className="admin-integration-actions">
            <button className="button" disabled={busy}>{busy ? t("saving") : t("saveIntegration")}</button>
            <button className="button secondary" type="button" disabled={busy} onClick={() => void testBot()}>{bot.botTest}</button>
          </div>
        </form>
      </details>

      <details className="admin-records-accordion">
        <summary>{t("yandexMapsIntegration")} · {statusLabel(status.yandexMaps.configured)}</summary>
        <form className="form admin-integration-form" key={`maps-${formVersion}`} onSubmit={(event) => void save(event, (data) => ({
          yandexMaps: {
            apiKey: fieldValue(data, "apiKey"),
            clearApiKey: checked(data, "clearApiKey")
          }
        }))}>
          <div className="field">
            <label>{t("yandexMapsApiKey")}</label>
            <input name="apiKey" type="password" autoComplete="new-password" placeholder={secretPlaceholder(status.yandexMaps.configured)} />
            {status.yandexMaps.configured && <label className="admin-integration-clear"><input type="checkbox" name="clearApiKey" /> {t("clearCurrentValue")}</label>}
          </div>
          <p className="small muted">{t("yandexMapsPublicKeyNotice")}</p>
          <button className="button" disabled={busy}>{busy ? t("saving") : t("saveIntegration")}</button>
        </form>
      </details>

      <details className="admin-records-accordion">
        <summary>{t("oauthIntegration")}</summary>
        <div className="admin-oauth-integrations">
          {oauthProviders.map(({ id, label }) => {
            const provider = status.oauth[id];
            return <form className="form admin-integration-form" key={`${id}-${formVersion}`} onSubmit={(event) => void save(event, (data) => ({
              oauth: {
                [id]: {
                  clientId: fieldValue(data, "clientId"),
                  clientSecret: fieldValue(data, "clientSecret"),
                  ...(id === "microsoft" ? { tenantId: fieldValue(data, "tenantId") } : {}),
                  clearClientId: checked(data, "clearClientId"),
                  clearClientSecret: checked(data, "clearClientSecret"),
                  ...(id === "microsoft" ? { clearTenantId: checked(data, "clearTenantId") } : {})
                }
              }
            }))}>
              <div className="section-head"><h3>{t(label)}</h3><span className={`status ${provider.configured ? "ok" : "pending"}`}>{statusLabel(provider.configured)}</span></div>
              <div className="field">
                <label>{t("oauthClientId")}</label>
                <input name="clientId" defaultValue={provider.clientId} maxLength={512} />
                {provider.clientId && <label className="admin-integration-clear"><input type="checkbox" name="clearClientId" /> {t("clearCurrentValue")}</label>}
              </div>
              <div className="field">
                <label>{t("oauthClientSecret")}</label>
                <input name="clientSecret" type="password" autoComplete="new-password" placeholder={secretPlaceholder(provider.hasClientSecret)} maxLength={1024} />
                {provider.hasClientSecret && <label className="admin-integration-clear"><input type="checkbox" name="clearClientSecret" /> {t("clearCurrentValue")}</label>}
              </div>
              {id === "microsoft" && <div className="field"><label>{t("oauthTenantId")}</label><input name="tenantId" defaultValue={provider.tenantId ?? "common"} maxLength={128} /></div>}
              <button className="button secondary" disabled={busy}>{busy ? t("saving") : t("saveIntegration")}</button>
            </form>;
          })}
        </div>
      </details>
    </>}
  </section>;
}
