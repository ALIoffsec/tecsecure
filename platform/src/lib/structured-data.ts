import type { Metadata } from "next";

/**
 * Search metadata and schema.org data, built in one place so every page states the business the same
 * way. Contact details come from the admin settings; nothing here invents a phone, price or claim.
 */

export const SITE_NAME = "Tecsecure";
/** The site-wide share image (app/opengraph-image.tsx), used where a page has no picture of its own. */
export const SITE_OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Tecsecure — IT va kiberxavfsizlik" };

type PageMetaInput = {
  path: string;
  title: string;
  description: string;
  /** The page's own picture (an absolute or site-relative URL); the site image otherwise. */
  image?: string | null;
  /** Use for the home page: the root layout's "%s | Tecsecure" template does not apply there. */
  absoluteTitle?: boolean;
  article?: { publishedTime?: string; modifiedTime?: string };
};

/** One page's title, description, canonical URL and share card. */
export function pageMetadata({ path, title, description, image, absoluteTitle, article }: PageMetaInput): Metadata {
  const shareTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const images = image ? [image] : [SITE_OG_IMAGE];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle, description, url: path, siteName: SITE_NAME, locale: "uz_UZ", images,
      ...(article ? { type: "article", ...article } : { type: "website" })
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: images.map(item => typeof item === "string" ? item : item.url) }
  };
}

/** Trims text to a search snippet without cutting a word in half. */
export function snippet(text: string, max = 160): string {
  const plain = text.replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[\s,.;:–—-]+$/, "")}…`;
}

/** The business address, shared with the service landing pages so search engines see one place. */
export function businessAddress(language: "uz" | "ru" = "uz") {
  return { "@type": "PostalAddress", addressLocality: language === "uz" ? "Toshkent" : "Ташкент", addressCountry: "UZ" };
}

/** Phone numbers as saved in admin: one per line (commas and the like are accepted too). */
export function splitPhones(raw: string | null | undefined): string[] {
  return [...new Set((raw ?? "").split(/[\n,;|]+/).map(phone => phone.trim()).filter(Boolean))];
}

/** A Telegram or Instagram setting ("@name", "name" or a full link) as a profile URL; null when empty. */
export function socialUrl(kind: "telegram" | "instagram", raw: string | null | undefined): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "").replace(/^(?:www\.)?(?:t\.me|telegram\.me|instagram\.com)\//i, "").replace(/\/+$/, "");
  if (!/^[A-Za-z0-9_.]+$/.test(handle)) return null;
  return kind === "telegram" ? `https://t.me/${handle}` : `https://instagram.com/${handle}`;
}

type Business = { origin: string; phones: string[]; email?: string | null; sameAs: string[] };

/** The home page graph: the organisation, the local business (Tashkent) and the site search. */
export function siteGraph({ origin, phones, email, sameAs }: Business) {
  const logo = `${origin}/icon-512.png`;
  const contact = {
    ...(phones.length ? { telephone: phones.length === 1 ? phones[0] : phones } : {}),
    ...(email ? { email } : {}),
    ...(sameAs.length ? { sameAs } : {})
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${origin}/#organization`, name: SITE_NAME, url: origin, logo, ...contact },
      {
        "@type": "LocalBusiness", "@id": `${origin}/#business`, name: SITE_NAME, url: origin, image: logo, logo,
        address: businessAddress("uz"), areaServed: { "@type": "City", name: "Toshkent" }, parentOrganization: { "@id": `${origin}/#organization` }, ...contact
      },
      {
        "@type": "WebSite", "@id": `${origin}/#website`, name: SITE_NAME, url: origin, inLanguage: ["uz", "ru", "en"], publisher: { "@id": `${origin}/#organization` },
        potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${origin}/search?q={search_term_string}` }, "query-input": "required name=search_term_string" }
      }
    ]
  };
}

const publisher = (origin: string) => ({ "@type": "Organization", name: SITE_NAME, url: origin, logo: { "@type": "ImageObject", url: `${origin}/icon-512.png` } });

export function articleLd(input: { origin: string; path: string; title: string; description: string; image?: string | null; publishedAt?: Date | null; updatedAt: Date }) {
  const url = `${input.origin}${input.path}`;
  return {
    "@context": "https://schema.org", "@type": "Article", headline: input.title.slice(0, 110), description: input.description, url, mainEntityOfPage: url, inLanguage: "uz",
    image: [input.image ? (input.image.startsWith("http") ? input.image : `${input.origin}${input.image}`) : `${input.origin}${SITE_OG_IMAGE.url}`],
    ...(input.publishedAt ? { datePublished: input.publishedAt.toISOString() } : {}),
    dateModified: input.updatedAt.toISOString(),
    author: publisher(input.origin), publisher: publisher(input.origin)
  };
}

export function courseLd(input: { origin: string; path: string; name: string; description: string; free: boolean }) {
  return {
    "@context": "https://schema.org", "@type": "Course", name: input.name, description: input.description, url: `${input.origin}${input.path}`,
    inLanguage: ["uz", "ru", "en"], isAccessibleForFree: input.free,
    provider: { "@type": "Organization", name: SITE_NAME, sameAs: input.origin }
  };
}

/** JSON for a <script type="application/ld+json"> tag, safe against a "</script>" inside the text. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
