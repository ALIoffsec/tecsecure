import { LocalizedText } from "@/components/site-preferences";
import { ServicesShowcase } from "@/components/services-showcase";
import { ManagedServices } from "@/components/managed-services";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";
import { TechnicalServices } from "@/components/service-journeys";
import { ServicesGuide, ServicesTop } from "@/components/services-top";
import { HOME_FACTS_KEY, parseHomeFacts } from "@/lib/home-facts";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [services, factsRecord] = isPreviewMode ? [[], null] as const : await Promise.all([
    prisma.service.findMany({ where: { status: "PUBLISHED", availability: true }, orderBy: { createdAt: "desc" } }),
    prisma.siteSetting.findUnique({ where: { key: HOME_FACTS_KEY }, select: { value: true } })
  ]);
  const facts = parseHomeFacts(factsRecord?.value);
  return <div className="container page-shell">
    <section className="services-unified">
      <div className="services-unified-heading">
        <span className="eyebrow"><LocalizedText id="services" /></span>
        <h1 className="page-title"><LocalizedText id="servicesPageTitle" /></h1>
        <p className="page-intro"><LocalizedText id="serviceScope" /></p>
      </div>
      <ServicesTop facts={facts} />
      <ServicesGuide facts={facts} />
      <TechnicalServices><ServicesShowcase />
      <ManagedServices services={services.map(({ id, name, description, media }) => ({ id, name, description, media }))} />
      </TechnicalServices>
    </section>
  </div>;
}
