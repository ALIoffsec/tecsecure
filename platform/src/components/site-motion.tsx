"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const CONTROLS = ".button, .shop-add-to-cart, .auth-submit, .shop-chip, .shop-quick-view, .shop-compare-button, .portal-icon-link, .portal-account, .preference-button, .account-button, .service-category-tab, .admin-management-category, .feature-hero-selector button, .work-arrow, .feature-wallet-flip, .feature-footer-pause";
const SURFACES = ".panel-card, .card, .shop-card, .hub-path, .feature-tile, .shop-summary, .product-buybox, .admin-sidebar, .customer-sidebar, .metric, .order-card, .need-card, .managed-service-card, .learn-module-card, .learn-path-card, .work-details, .original-auth";
const REVEAL = "main :is(.section-head, .hub-path, .shop-card, .need-card, .managed-service-card, .learn-module-card, .learn-path-card, .work-carousel, .feature-tile, .home-contact-section .hub-contact)";

/** Backdrop refraction only renders in Chromium, and only desktops can afford it. */
function canRefract() {
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[]; mobile?: boolean } }).userAgentData;
  return Boolean(brands?.brands?.some(item => item.brand === "Chromium") && !brands.mobile)
    && window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-transparency: no-preference)").matches;
}

export function SiteMotion() {
  const pathname = usePathname();

  // Page arrival: a short settle, never a wait.
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const main = document.getElementById("main-content");
    if (!main || preference.matches) return;
    const animation = main.animate([{ opacity: .35, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], {
      duration: 480, easing: "cubic-bezier(.22, 1, .36, 1)"
    });
    const stop = () => { if (preference.matches) animation.cancel(); };
    preference.addEventListener("change", stop);
    return () => { animation.cancel(); preference.removeEventListener("change", stop); };
  }, [pathname]);

  // Blocks below the fold surface as they scroll in. Marked from script, so nothing hides without it.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.removeAttribute("data-reveal");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -6% 0px" });
    const marked: Element[] = [];
    document.querySelectorAll(REVEAL).forEach(element => {
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      element.setAttribute("data-reveal", "");
      observer.observe(element);
      marked.push(element);
    });
    return () => { observer.disconnect(); marked.forEach(element => element.removeAttribute("data-reveal")); };
  }, [pathname]);

  // The light follows the pointer across glass; a press sends a ripple through it.
  useEffect(() => {
    const root = document.documentElement;
    if (canRefract()) root.dataset.refract = "";
    let frame = 0;
    let lastEvent: PointerEvent | null = null;
    let lit: HTMLElement[] = [];
    const paint = () => {
      frame = 0;
      if (!lastEvent || !(lastEvent.target instanceof Element)) return;
      const targets = [lastEvent.target.closest<HTMLElement>(CONTROLS), lastEvent.target.closest<HTMLElement>(SURFACES)].filter((item): item is HTMLElement => Boolean(item));
      lit.filter(item => !targets.includes(item)).forEach(item => { item.style.removeProperty("--lx"); item.style.removeProperty("--ly"); });
      lit = targets;
      for (const item of targets) {
        const box = item.getBoundingClientRect();
        item.style.setProperty("--lx", `${lastEvent.clientX - box.left}px`);
        item.style.setProperty("--ly", `${lastEvent.clientY - box.top}px`);
      }
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      lastEvent = event;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const control = event.target.closest<HTMLElement>(CONTROLS);
      if (!control || control.matches(":disabled")) return;
      const box = control.getBoundingClientRect();
      control.style.setProperty("--rx", `${event.clientX - box.left}px`);
      control.style.setProperty("--ry", `${event.clientY - box.top}px`);
      const reach = Math.hypot(box.width, box.height) / 7;
      control.animate([
        { transform: "scale(.2)", opacity: .75 },
        { transform: `scale(${reach})`, opacity: 0 }
      ], { duration: 720, easing: "cubic-bezier(.22, 1, .36, 1)", pseudoElement: "::after" });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      delete root.dataset.refract;
    };
  }, []);

  return <svg className="liquid-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
    <filter id="liquid-refract" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".008 .013" numOctaves="2" seed="11" result="noise" />
      <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
      <feDisplacementMap in="SourceGraphic" in2="soft" scale="34" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs></svg>;
}
