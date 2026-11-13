"use client";

import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";
import { MediaGallery } from "@/components/media-uploader";
import Link from "next/link";
import { journeyCopy, inquiryHref } from "@/lib/journey-copy";

const serviceItems = [
  { icon: "monitor", title: "managedServicesTitle", description: "managedServicesDescription" },
  { icon: "settings", title: "itManagementTitle", description: "itManagementDescription" },
  { icon: "phone", title: "voipSolutionsTitle", description: "voipSolutionsDescription" },
  { icon: "clock", title: "monitoringServiceTitle", description: "monitoringServiceDescription" },
  { icon: "shield", title: "networkSecurityTitle", description: "networkSecurityDescription" },
  { icon: "refresh", title: "lifecycleSupportTitle", description: "lifecycleSupportDescription" }
] as const;

type PublishedService = { id: string; slug: string; name: string; description: string; media: unknown };

export function ManagedServices({ services }: { services: PublishedService[] }) {
  const { t, locale } = useSitePreferences();
  return (
    <div className="managed-service-grid">
      {serviceItems.map(({ icon, title, description }) => (
        <article className="managed-service-card is-clickable-card" key={title}>
          <div className="managed-service-icon" aria-hidden="true"><UiIcon name={icon} size={25} /></div>
          <h3><Link className="card-link" href={inquiryHref(t(title))}>{t(title)}</Link></h3>
          <p>{t(description)}</p>
          <Link className="text-link" href={inquiryHref(t(title))}>{journeyCopy[locale].discuss} →</Link>
        </article>
      ))}
      {services.map((service) => (
        <article className="managed-service-card is-clickable-card" key={service.id}>
          <h3><Link className="card-link" href={`/services/${service.slug}`}>{service.name}</Link></h3>
          <p>{service.description}</p>
          <div className="card-media-static"><MediaGallery media={service.media} title={service.name} firstOnly /></div>
          <Link className="text-link" href={`/contact?service=${encodeURIComponent(service.id)}`}>{journeyCopy[locale].discuss} →</Link>
        </article>
      ))}
    </div>
  );
}
