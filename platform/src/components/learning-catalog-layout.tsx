"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon, type IconName } from "@/components/ui-icon";
import { learningUi } from "@/lib/learning-ui";

export function LearningCatalogLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useSitePreferences();
  const tx = learningUi[locale];
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const items: { href: string; label: string; icon: IconName }[] = [
    { href: "/learning", label: tx.catalogOverview, icon: "home" },
    { href: "/learning/paths", label: tx.catalogPaths, icon: "network" },
    { href: "/learning/modules", label: tx.catalogModules, icon: "book" },
    { href: "/learning/exams", label: tx.catalogExams, icon: "clipboard" },
    { href: "/learning/ctf", label: tx.catalogCtf, icon: "shield" },
    { href: "/learning/dashboard", label: tx.catalogProgress, icon: "user" },
    { href: "/learning/practice", label: tx.catalogPracticeLabel, icon: "layout" }
  ];

  const isModuleDetail = /^\/learning\/[^/]+$/.test(pathname)
    && !["paths", "modules", "labs", "exams", "ctf", "dashboard", "practice"].includes(pathname.split("/")[2] ?? "");
  const isActive = (href: string) => href === "/learning"
    ? pathname === href
    : href === "/learning/practice" && pathname.startsWith("/learning/labs/")
      ? true
    : href === "/learning/modules" && isModuleDetail
      ? true
      : pathname === href || pathname.startsWith(`${href}/`);
  const activeItem = items.find((item) => isActive(item.href));

  return (
    <div className={`learning-catalog-layout${open ? " is-open" : ""}`}>
      <aside className={`learning-catalog-sidebar${open ? " is-open" : ""}`}>
        <button
          aria-controls="learning-catalog-navigation"
          aria-expanded={open}
          aria-label={open ? tx.catalogClose : tx.catalogOpen}
          className="learning-catalog-toggle"
          onClick={() => setOpen((value) => !value)}
          title={open ? tx.catalogClose : tx.catalogOpen}
          type="button"
        >
          <span className={`learning-catalog-chevron${open ? " is-open" : ""}`} aria-hidden="true">&gt;</span>
          {open && <span>{tx.catalogMenuTitle}</span>}
        </button>
        {open && (
          <>
            <div className="learning-catalog-mobile-heading">
              <strong>{tx.catalogMenuTitle}</strong>
              {activeItem && <span>{activeItem.label}</span>}
            </div>
            <nav aria-label={tx.catalogMenuTitle} className="learning-catalog-navigation" id="learning-catalog-navigation">
              {items.map((item) => (
                <Link
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={isActive(item.href) ? "is-active" : ""}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  <UiIcon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </>
        )}
      </aside>
      {open && <button aria-label={tx.catalogClose} className="learning-catalog-overlay" onClick={() => setOpen(false)} type="button" />}
      <div className="learning-catalog-content">{children}</div>
    </div>
  );
}
