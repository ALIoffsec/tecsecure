import { LocalizedText } from "@/components/site-preferences";
import { ServicesShowcase } from "@/components/services-showcase";
import { ManagedServices } from "@/components/managed-services";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = isPreviewMode ? [] : await prisma.service.findMany({
    where: { status: "PUBLISHED", availability: true },
    orderBy: { createdAt: "desc" }
  });
  return <div className="container page-shell">
    <section className="services-unified">
      <div className="services-unified-heading">
        <span className="eyebrow"><LocalizedText id="services" /></span>
        <h1 className="page-title"><LocalizedText id="servicesPageTitle" /></h1>
        <p className="page-intro"><LocalizedText id="serviceScope" /></p>
      </div>
      <ServicesShowcase />
      <ManagedServices services={services.map(({ id, name, description, media }) => ({ id, name, description, media }))} />
    </section>
  </div>;
}
