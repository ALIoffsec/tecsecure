import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { PageBackLink } from "@/components/page-back-link";
import { FontLoader } from "@/components/font-loader";
import { SiteFooter, SitePreferencesProvider, preferenceBootstrapScript } from "@/components/site-preferences";
import { SiteBlocksRenderer, type SiteBlockRecord } from "@/components/site-block-manager";
import { prisma } from "@/lib/prisma";
import { learningModules, learningPaths } from "@/lib/learning-demo";
import { toLearningModulePreview } from "@/lib/learning-catalog-data";
import { LearningCatalogProvider } from "@/components/learning-catalog-context";
import type { Locale, MessageKey } from "@/lib/messages";
import { isSiteDesign } from "@/lib/site-designs";
import { isPreviewMode } from "@/lib/preview-mode";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export const metadata: Metadata = {
  title: "Tecsecure — IT va xavfsizlik yechimlari",
  description: "IT infratuzilma, jismoniy xavfsizlik va texnik xizmatlar.",
  robots: { index: true, follow: true },
  applicationName: "Tecsecure",
  manifest: "/manifest.webmanifest",
  appleWebApp: { title: "Tecsecure", capable: true },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.ico", sizes: "any" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [content, siteBlocks, designSetting] = isPreviewMode
    ? [[], [] as SiteBlockRecord[], null] as const
    : await Promise.all([
      prisma.contentOverride.findMany({ select: { locale: true, key: true, value: true } }),
      prisma.siteBlock.findMany({ where: { enabled: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
      prisma.siteSetting.findUnique({ where: { key: "siteDesign" }, select: { value: true } })
    ]);
  const design = isSiteDesign(designSetting?.value) ? designSetting.value : "midnight";
  const learningCatalog = {
    modules: learningModules.map(toLearningModulePreview),
    paths: learningPaths
  };
  const overrides: Partial<Record<Locale, Partial<Record<MessageKey, string>>>> = {};
  for (const item of content) {
    if (item.locale === "uz" || item.locale === "ru" || item.locale === "en") {
      const localeOverrides = overrides[item.locale] ?? (overrides[item.locale] = {});
      localeOverrides[item.key as MessageKey] = item.value;
    }
  }
  return (
    <html lang="uz" data-design={design} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: preferenceBootstrapScript }} />
        <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" /></noscript>
      </head>
      <body>
        <ServiceWorkerRegistration />
        <FontLoader />
        <SitePreferencesProvider overrides={overrides}>
          <LearningCatalogProvider data={learningCatalog}>
            <SiteNav />
            <PageBackLink />
            <main>{children}</main>
            <SiteBlocksRenderer blocks={siteBlocks} />
            <SiteFooter />
          </LearningCatalogProvider>
        </SitePreferencesProvider>
      </body>
    </html>
  );
}
