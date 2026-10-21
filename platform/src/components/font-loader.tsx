"use client";

import { useEffect } from "react";

const fontStylesheet = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap";

export function FontLoader() {
  useEffect(() => {
    if (document.getElementById("site-fonts")) return;
    const link = document.createElement("link");
    link.id = "site-fonts";
    link.rel = "stylesheet";
    link.href = fontStylesheet;
    link.media = "print";
    link.addEventListener("load", () => { link.media = "all"; }, { once: true });
    document.head.append(link);
  }, []);

  return null;
}
