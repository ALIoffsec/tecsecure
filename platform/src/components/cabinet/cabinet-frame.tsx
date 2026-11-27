"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CabinetNav, type CabinetNavState } from "./cabinet-nav";
import { CabinetHeader } from "./cabinet-header";

export type CabinetUser = { name: string; contact: string | null; maskedPhone: string | null; staff: boolean };

/**
 * The cabinet's frame: a compact header, the side menu on a computer, and the page. The home draws its own
 * head (greeting, wallet, fresh counts), so the frame's head is for inner pages only.
 */
export function CabinetFrame({ user, nav, unread, children }: { user: CabinetUser; nav: CabinetNavState; unread: number; children: ReactNode }) {
  const pathname = usePathname();
  return <div className="container page-shell customer-portal cab-portal">
    <div className="cab-workspace">
      <aside className="cab-side"><CabinetNav state={nav} /></aside>
      <div className="cab-content">
        {pathname !== "/portal" && <CabinetHeader user={user} unread={unread} />}
        {children}
      </div>
    </div>
  </div>;
}
