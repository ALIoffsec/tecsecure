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
    { href: "/learning/labs", label: tx.catalogLabs, icon: "toolbox" },
    { href: "/learning/exams", label: tx.catalogExams, icon: "clipboard" },
    { href: "/learning/ctf", label: tx.catalogCtf, icon: "shield" },
    { href: "/learning/dashboard", label: tx.catalogProgress, icon: "user" },
    { href: "/learning/practice", label: tx.catalogPracticeLabel, icon: "layout" }
  ];

  const isModuleDetail = /^\/learning\/[^/]+$/.test(pathname)
    && !["paths", "modules", "labs", "exams", "ctf", "dashboard", "practice"].includes(pathname.split("/")[2] ?? "");
  const isActive = (href: string) => href === "/learning"
    ? pathname === href
    : href === "/learning/modules" && isModuleDetail
      ? true
      : pathname === href || pathname.startsWith(`${href}/`);

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
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {open && <span>{tx.catalogMenuTitle}</span>}
        </button>
        {open && (
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
        )}
      </aside>
      {open && <button aria-label={tx.catalogClose} className="learning-catalog-overlay" onClick={() => setOpen(false)} type="button" />}
      <div className="learning-catalog-content">{children}</div>
    </div>
  );
}
