"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountSessionActions } from "@/components/account-session-actions";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";
import { cabinetLabels, cabinetSectionOf, cabinetSections, type CabinetSection } from "@/lib/cabinet-routes";

export type CabinetNavState = { show: Partial<Record<CabinetSection, boolean>>; counts: Partial<Record<CabinetSection, number>> };

/**
 * The cabinet's side menu on a computer. On a phone the cabinet's home cards lead to every section instead.
 * Counts are only for things waiting on the customer, never totals.
 */
export function CabinetNav({ state }: { state: CabinetNavState }) {
  const pathname = usePathname();
  const { locale } = useSitePreferences();
  const labels = cabinetLabels[locale];
  const current = cabinetSectionOf(pathname);
  const items = cabinetSections.filter(item => !item.optional || state.show[item.id] || current === item.id);
  return <nav className="cab-nav" aria-label={labels.nav}>
    <ul>
      {items.map(item => {
        const count = state.counts[item.id] ?? 0;
        return <li key={item.id}>
          <Link className="cab-nav-item" href={item.href} aria-current={current === item.id ? "page" : undefined}>
            <span className="cab-nav-icon"><UiIcon name={item.icon} /></span>
            <span className="cab-nav-label">{labels[item.id]}</span>
            {count > 0 && <span className="cab-nav-count">{count > 9 ? "9+" : count}</span>}
          </Link>
        </li>;
      })}
    </ul>
    <div className="cab-nav-signout"><AccountSessionActions compact /></div>
  </nav>;
}
