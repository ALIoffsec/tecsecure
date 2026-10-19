import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { PageBackLink } from "@/components/page-back-link";
import { SiteFooter, SitePreferencesProvider, preferenceBootstrapScript } from "@/components/site-preferences";
import { SiteBlocksRenderer, type SiteBlockRecord } from "@/components/site-block-manager";
import { prisma } from "@/lib/prisma";
import { learningModules, learningPaths } from "@/lib/learning-demo";
import { toLearningModulePreview } from "@/lib/learning-catalog-data";
import { LearningCatalogProvider } from "@/components/learning-catalog-context";
import type { Locale, MessageKey } from "@/lib/messages";
import { isSiteDesign } from "@/lib/site-designs";
import { isPreviewMode } from "@/lib/preview-mode";

export const metadata: Metadata = {
  title: "Tecsecure — IT va xavfsizlik yechimlari",
  description: "IT infratuzilma, jismoniy xavfsizlik va texnik xizmatlar.",
  robots: { index: true, follow: true }
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
        <script dangerouslySetInnerHTML={{ __html: preferenceBootstrapScript }} />
      </head>
      <body>
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
