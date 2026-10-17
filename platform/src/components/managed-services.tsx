"use client";

import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";
import { MediaGallery } from "@/components/media-uploader";

const serviceItems = [
  { icon: "monitor", title: "managedServicesTitle", description: "managedServicesDescription" },
  { icon: "settings", title: "itManagementTitle", description: "itManagementDescription" },
  { icon: "phone", title: "voipSolutionsTitle", description: "voipSolutionsDescription" },
  { icon: "clock", title: "monitoringServiceTitle", description: "monitoringServiceDescription" },
  { icon: "shield", title: "networkSecurityTitle", description: "networkSecurityDescription" },
  { icon: "refresh", title: "lifecycleSupportTitle", description: "lifecycleSupportDescription" }
] as const;

type PublishedService = { id: string; name: string; description: string; media: unknown };

export function ManagedServices({ services }: { services: PublishedService[] }) {
  const { t } = useSitePreferences();
  return (
    <div className="managed-service-grid">
      {serviceItems.map(({ icon, title, description }) => (
        <article className="managed-service-card" key={title}>
          <div className="managed-service-icon" aria-hidden="true"><UiIcon name={icon} size={25} /></div>
          <h3>{t(title)}</h3>
          <p>{t(description)}</p>
        </article>
      ))}
      {services.map((service) => (
        <article className="managed-service-card" key={service.id}>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <MediaGallery media={service.media} title={service.name} />
        </article>
      ))}
    </div>
  );
}
