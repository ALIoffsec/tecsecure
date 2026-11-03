"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SiteMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const main = document.getElementById("main-content");
    if (!main || preference.matches) return;
    const animation = main.animate([{ opacity: 0.65 }, { opacity: 1 }], {
      duration: 360, easing: "cubic-bezier(.22, 1, .36, 1)"
    });
    const stop = () => { if (preference.matches) animation.cancel(); };
    preference.addEventListener("change", stop);
    return () => { animation.cancel(); preference.removeEventListener("change", stop); };
  }, [pathname]);
  return null;
}
