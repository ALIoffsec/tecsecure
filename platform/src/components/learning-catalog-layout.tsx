"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";

const words = {
  uz: { nav: "Ta’lim bo‘limlari", home: "Mening o‘qishim", modules: "Modullar", paths: "Yo‘llar", certifications: "Sertifikatlar", labs: "Laboratoriyalar" },
  ru: { nav: "Разделы обучения", home: "Моё обучение", modules: "Модули", paths: "Пути", certifications: "Сертификаты", labs: "Лаборатории" },
  en: { nav: "Learning sections", home: "My learning", modules: "Modules", paths: "Paths", certifications: "Certificates", labs: "Labs" }
} as const;

type Tab = "home" | "modules" | "paths" | "certifications" | "labs";
const tabs: { id: Tab; href: string }[] = [
  { id: "home", href: "/learning" },
  { id: "modules", href: "/learning/modules" },
  { id: "paths", href: "/learning/paths" },
  { id: "certifications", href: "/learning/certifications" },
  { id: "labs", href: "/learning/labs" }
];

/** Which of the four sections (or the learning home) an address belongs to. */
export function learningTabOf(pathname: string): Tab | null {
  if (pathname === "/learning") return "home";
  const part = pathname.split("/")[2] ?? "";
  if (part === "modules") return "modules";
  if (part === "paths") return "paths";
  if (part === "certifications" || part === "exams") return "certifications";
  if (part === "labs" || part === "practice" || part === "ctf") return "labs";
  if (part === "business" || part === "dashboard") return null;
  return part ? "modules" : null;
}

/**
 * Learning keeps one navigation on every page: a glass segmented control with a sliding indicator (it scrolls
 * sideways on a phone without moving the page). The learning home is its first, icon-only segment.
 */
export function LearningCatalogLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const pathname = usePathname() ?? "";
  const active = learningTabOf(pathname);
  const bar = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const element = bar.current?.querySelector<HTMLElement>("[aria-current='page']");
    if (!element || !bar.current) { setIndicator(null); return; }
    setIndicator({ left: element.offsetLeft, width: element.offsetWidth });
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active, locale]);

  return <div className="learning-catalog-layout learn-shell">
    <nav className="learn-segments" aria-label={w.nav}>
      <div className="learn-segments-track" ref={bar}>
        {indicator && <span className="learn-segments-indicator" aria-hidden="true" style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }} />}
        {tabs.map(tab => <Link key={tab.id} href={tab.href} className={`learn-segment${tab.id === "home" ? " is-icon" : ""}`} aria-current={active === tab.id ? "page" : undefined} aria-label={tab.id === "home" ? w.home : undefined} title={tab.id === "home" ? w.home : undefined}>
          {tab.id === "home" ? <UiIcon name="home" size={18} /> : w[tab.id]}
        </Link>)}
      </div>
    </nav>
    <div className="learning-catalog-content">{children}</div>
  </div>;
}
