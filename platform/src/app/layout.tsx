import type { Metadata } from "next";
import "./globals.css";
import "./journeys.css";
import "./liquid-glass.css";
import "./feature-effects.css";
import "./original-buttons.css";
import "./original-effects.css";
import "./store.css";
import "./admin.css";
import "./liquid-water.css";
import "./liquid-ui.css";
import "./liquid-search.css";
import "./growth.css";
import "./home.css";
import "./tma.css";
import { SiteNav } from "@/components/site-nav";
import { PageBackLink } from "@/components/page-back-link";
import { FontLoader } from "@/components/font-loader";
import { SiteFooter, SitePreferencesProvider, preferenceBootstrapScript } from "@/components/site-preferences";
import { SiteBlocksRenderer, type SiteBlockRecord } from "@/components/site-block-manager";
import { prisma } from "@/lib/prisma";
import { toLearningModulePreview } from "@/lib/learning-catalog-data";
import { getPublishedLearningDocuments } from "@/lib/learning-content";
import { LearningCatalogProvider } from "@/components/learning-catalog-context";
import type { Locale, MessageKey } from "@/lib/messages";
import { isSiteDesign } from "@/lib/site-designs";
import { isPreviewMode } from "@/lib/preview-mode";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { ToastProvider } from "@/components/toast-provider";
import { CurrencyProvider } from "@/components/currency-context";
import { ProductCompareProvider } from "@/components/product-compare";
import { SiteMotion } from "@/components/site-motion";
import { ContactDock } from "@/components/shop-extras";
import { TelegramBridge } from "@/components/telegram-app";
import { SiteChrome } from "@/components/site-chrome";
import { siteOrigin } from "@/lib/site-origin";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: "Tecsecure — IT va xavfsizlik yechimlari",
  description: "IT va xavfsizlik xizmatlari, amaliy ta’lim va uskunalar do‘koni — bitta Tecsecure platformasida.",
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
  const design = isSiteDesign(designSetting?.value) ? designSetting.value : "liquid";
  const [modules, paths] = await Promise.all([
    getPublishedLearningDocuments("module"),
    getPublishedLearningDocuments("path")
  ]);
  const learningCatalog = { modules: modules.map(toLearningModulePreview), paths };
  const overrides: Partial<Record<Locale, Partial<Record<MessageKey, string>>>> = {};
  for (const item of content) {
    if (item.locale === "uz" || item.locale === "ru" || item.locale === "en") {
      const localeOverrides = overrides[item.locale] ?? (overrides[item.locale] = {});
      localeOverrides[item.key as MessageKey] = item.value;
    }
  }
  return (
    <html lang="uz" data-design={design} data-material="liquid" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: preferenceBootstrapScript }} />
        <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" /></noscript>
      </head>
      <body id="app-shell">
        <ServiceWorkerRegistration />
        <FontLoader />
        <SiteChrome><SiteMotion /></SiteChrome>
        <SitePreferencesProvider overrides={overrides}>
          <CurrencyProvider>
            <ToastProvider>
              <LearningCatalogProvider data={learningCatalog}>
                <ProductCompareProvider>
                <TelegramBridge />
                <SiteChrome><SiteNav /><PageBackLink /></SiteChrome>
                <main id="main-content" tabIndex={-1}>{children}</main>
                <SiteChrome><SiteBlocksRenderer blocks={siteBlocks} /><SiteFooter /><ContactDock /></SiteChrome>
                </ProductCompareProvider>
              </LearningCatalogProvider>
            </ToastProvider>
          </CurrencyProvider>
        </SitePreferencesProvider>
      </body>
    </html>
  );
}
