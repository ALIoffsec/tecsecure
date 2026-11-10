"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** The site's header, footer, intro and effects. Left out on /tg, where the Telegram Mini Apps draw their own frame. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname === "/tg" || pathname.startsWith("/tg/") ? null : <>{children}</>;
}
