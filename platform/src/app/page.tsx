import { HomeContent } from "@/components/home-content";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";
import { HOME_FACTS_KEY, parseHomeFacts } from "@/lib/home-facts";
import { PARTNER_BRANDS_KEY, parsePartnerBrands } from "@/lib/partner-brands";
import { loadProductCards } from "@/lib/product-listing";
import { pickShowcase } from "@/lib/home-showcase";
import { defaultContact } from "@/lib/site-contact";
import { siteOrigin } from "@/lib/site-origin";
import { jsonLd, pageMetadata, siteGraph, socialUrl, splitPhones } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/",
  title: "Toshkentda videokuzatuv, tarmoq va kiberxavfsizlik | Tecsecure",
  description: "Tecsecure Toshkentda IP videokuzatuv o‘rnatadi, ofis tarmog‘i va Wi-Fi quradi, kiberxavfsizlik auditini o‘tkazadi. Uskunalar do‘koni va amaliy IT kurslari.",
  absoluteTitle: true
});

export default async function HomePage() {
  if (isPreviewMode) return <HomeContent contact={{}} work={[]} products={[]} facts={parseHomeFacts(null)} brands={parsePartnerBrands(null)} />;
  const [settings, work, candidates, factsRecord, brandsRecord] = await Promise.all([
    prisma.siteSetting.findMany({ where: { key: { in: ["phone", "email", "telegram", "instagram"] } } }),
    prisma.portfolioPost.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", priceMinor: { not: null } },
      select: { id: true, name: true, category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" }, take: 300
    }),
    prisma.siteSetting.findUnique({ where: { key: HOME_FACTS_KEY }, select: { value: true } }),
    prisma.siteSetting.findUnique({ where: { key: PARTNER_BRANDS_KEY }, select: { value: true } })
  ]);
  const picked = pickShowcase(candidates, 8).map(product => product.id);
  const cards = picked.length ? await loadProductCards({ id: { in: picked } }, "new", 0, picked.length) : [];
  const contact: Record<string, string> = Object.fromEntries(settings.map(({ key, value }) => [key, value]));
  // Who we are for search engines: the numbers, mailbox and profiles saved in admin (the phone falls back
  // to the one the service pages already show).
  const graph = siteGraph({
    origin: siteOrigin(),
    phones: splitPhones(contact.phone || defaultContact.phone),
    email: contact.email?.trim() || null,
    sameAs: [socialUrl("instagram", contact.instagram), socialUrl("telegram", contact.telegram)].filter((url): url is string => Boolean(url))
  });
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(graph) }} />
    <HomeContent
      contact={contact}
      work={work}
      products={picked.flatMap(id => cards.filter(card => card.id === id))}
      facts={parseHomeFacts(factsRecord?.value)}
      brands={parsePartnerBrands(brandsRecord?.value)} />
  </>;
}
