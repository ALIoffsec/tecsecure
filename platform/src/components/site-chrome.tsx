"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** The site's header, footer, intro and effects. Left out on /tg (the Telegram Mini Apps) and /shop (the seller app in a browser), which draw their own frame. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ownApp = pathname === "/tg" || pathname.startsWith("/tg/") || pathname === "/shop";
  return ownApp ? null : <>{children}</>;
}
