"use client";

import { useEffect } from "react";
import { fontStylesheetFor } from "@/lib/site-fonts";

/**
 * Loads, after the page has painted, only the Google Fonts the active design uses. The default liquid design
 * runs on the system font, so it fetches just the two families a few base rules still name. When admin
 * switches the design live, the new design's families are added.
 */
export function FontLoader() {
  useEffect(() => {
    const root = document.documentElement;
    const load = () => {
      const href = fontStylesheetFor(root.dataset.design);
      if (document.querySelector(`link[data-site-fonts="${CSS.escape(href)}"]`)) return;
      const link = document.createElement("link");
      link.dataset.siteFonts = href;
      link.rel = "stylesheet";
      link.href = href;
      link.media = "print";
      link.addEventListener("load", () => { link.media = "all"; }, { once: true });
      document.head.append(link);
    };
    load();
    const observer = new MutationObserver(load);
    observer.observe(root, { attributes: true, attributeFilter: ["data-design"] });
    return () => observer.disconnect();
  }, []);

  return null;
}
