"use client";

import Link from "next/link";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";

const fallbackPhones = ["+998200141455", "+998990782102", "+998931970006"];

/** Shared "quick contact" CTA block (phones/email/telegram/instagram + callback/quote buttons). */
export function QuickContactCta({ contact }: { contact: Record<string, string> }) {
  const { t } = useSitePreferences();
  const phones = (contact.phone || fallbackPhones.join("\n"))
    .split(/[\n,;|]+/)
    .map((phone) => phone.trim())
    .filter(Boolean);
  const email = contact.email || "itstars134567890@gmail.com";
  const telegram = (contact.telegram || "@abdiazizov_m_ali").replace(/^@/, "");
  const instagram = (contact.instagram || "@abdiazizov_m_ali").replace(/^@/, "");
  return (
    <section className="contact-hero" id="contact">
      <div className="container contact-panel">
        <div className="contact-brand">
          <span className="eyebrow">{t("quickContactEyebrow")}</span>
          <h2>{t("quickContactTitle")}</h2>
          <h3 className="contact-ready-title">{t("contactReadyTitle")}</h3>
          <p className="lead">{t("contactReadyDescription")}</p>
          <div className="hero-actions contact-actions">
            <Link className="button" href="/contact">{t("requestCallback")}</Link>
            <Link className="button ghost" href="/request-quote">{t("requestAQuote")}</Link>
          </div>
        </div>
        <nav className="contact-details" aria-label={t("quickContactTitle")}>
          <div className="contact-icon-group" role="group" aria-label={t("phoneNumbers")}>
            {phones.map((phone) => (
              <a className="contact-icon-link" key={phone} href={`tel:${phone.replace(/[^\d+]/g, "")}`} aria-label={`${t("phoneNumbers")}: ${phone}`} title={`${t("phoneNumbers")}: ${phone}`}>
                <UiIcon name="phone" />
                <span className="sr-only">{phone}</span>
              </a>
            ))}
          </div>
          <a className="contact-icon-link" href={`mailto:${email}`} aria-label={`${t("contactEmail")}: ${email}`} title={`${t("contactEmail")}: ${email}`}>
            <UiIcon name="mail" />
            <span className="sr-only">{email}</span>
          </a>
          <a className="contact-icon-link" href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer" aria-label={`${t("contactTelegram")}: @${telegram}`} title={`${t("contactTelegram")}: @${telegram}`}>
            <UiIcon name="send" />
            <span className="sr-only">@{telegram}</span>
          </a>
          <a className="contact-icon-link" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" aria-label={`${t("contactInstagram")}: @${instagram}`} title={`${t("contactInstagram")}: @${instagram}`}>
            <UiIcon name="instagram" />
            <span className="sr-only">@{instagram}</span>
          </a>
        </nav>
      </div>
    </section>
  );
}
