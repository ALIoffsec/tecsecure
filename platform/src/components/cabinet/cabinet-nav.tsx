"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountSessionActions } from "@/components/account-session-actions";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";
import { CABINET_GROUPS, cabinetLabels, cabinetSectionOf, cabinetSections, type CabinetSection } from "@/lib/cabinet-routes";

export type CabinetNavState = { show: Partial<Record<CabinetSection, boolean>>; counts: Partial<Record<CabinetSection, number>> };

/**
 * The cabinet's side menu on a computer, in the same three groups as the avatar menu. On a phone the home
 * tiles and the avatar menu lead to every section instead. Counts are only for things waiting on the customer.
 */
export function CabinetNav({ state }: { state: CabinetNavState }) {
  const pathname = usePathname();
  const { locale } = useSitePreferences();
  const labels = cabinetLabels[locale];
  const current = cabinetSectionOf(pathname);
  const items = cabinetSections.filter(item => !item.optional || state.show[item.id] || current === item.id);
  return <nav className="cab-nav" aria-label={labels.nav}>
    {CABINET_GROUPS.map(group => <div className="cab-nav-group" key={group}>
      <h2 className="cab-nav-heading">{labels.groups[group]}</h2>
      <ul>
        {items.filter(item => item.group === group).map(item => {
          const count = state.counts[item.id] ?? 0;
          return <li key={item.id}>
            <Link className="cab-nav-item" href={item.href} aria-current={current === item.id ? "page" : undefined}>
              <span className="cab-nav-icon"><UiIcon name={item.icon} /></span>
              <span className="cab-nav-label">{item.id === "home" ? labels.profile : labels[item.id]}</span>
              {count > 0 && <span className="cab-nav-count">{count > 9 ? "9+" : count}</span>}
            </Link>
          </li>;
        })}
      </ul>
    </div>)}
    <div className="cab-nav-signout"><AccountSessionActions compact /></div>
  </nav>;
}
