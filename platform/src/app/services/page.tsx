import { LocalizedText } from "@/components/site-preferences";
import { ServicesShowcase } from "@/components/services-showcase";
import { ManagedServices } from "@/components/managed-services";
import { QuickContactCta } from "@/components/quick-contact-cta";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [services, settings] = isPreviewMode ? [[], []] : await Promise.all([
    prisma.service.findMany({
      where: { status: "PUBLISHED", availability: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.siteSetting.findMany({ where: { key: { in: ["phone", "email", "telegram", "instagram"] } } })
  ]);
  const contact = Object.fromEntries(settings.map(({ key, value }) => [key, value]));
  return <>
    <div className="container page-shell">
      <section className="services-unified">
        <div className="services-unified-heading">
          <span className="eyebrow"><LocalizedText id="services" /></span>
          <h1 className="page-title"><LocalizedText id="servicesPageTitle" /></h1>
          <p className="page-intro"><LocalizedText id="serviceScope" /></p>
        </div>
        <ServicesShowcase />
        <ManagedServices services={services.map(({ id, name, description, media }) => ({ id, name, description, media }))} />
      </section>
    </div>
    <QuickContactCta contact={contact} />
  </>;
}
