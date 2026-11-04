"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createBurningIntro, introStorageKey } from "@/lib/burning-intro";
import { featureCopy } from "@/lib/feature-copy";
import { useSitePreferences } from "./site-preferences";

export function SiteIntro() {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [finished, setFinished] = useState(false);
  const [fallback, setFallback] = useState(false);
  const { locale } = useSitePreferences();
  const c = featureCopy[locale];
  const close = useCallback(() => {
    dialog.current?.close();
    delete document.documentElement.dataset.tecIntro;
    try { sessionStorage.setItem(introStorageKey, "1"); }
    catch (error) { console.warn("Tecsecure intro completion could not be remembered", error); }
    setFinished(true);
  }, []);

  useEffect(() => {
    const element = dialog.current;
    const surface = canvas.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (finished || !element || !surface) return;
    if (document.documentElement.dataset.tecIntro !== "pending" || preference.matches) {
      close();
      return;
    }
    let renderer: ReturnType<typeof createBurningIntro> | undefined;
    let frame = 0;
    let timer = 0;
    let stopped = false;
    const start = performance.now();
    const fail = (error: unknown) => {
      console.warn("Tecsecure opening uses a static fallback", error);
      stopped = true;
      cancelAnimationFrame(frame);
      setFallback(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(close, 1000);
    };
    const onPreference = () => { if (preference.matches) close(); };
    const onContextLost = (event: Event) => { event.preventDefault(); fail(new Error("Intro WebGL context lost")); };
    const onResize = () => {
      if (stopped) return;
      try { renderer?.resize(); } catch (error) { fail(error); }
    };
    const draw = (now: number) => {
      if (stopped) return;
      const elapsed = now - start;
      if (elapsed >= 4200) { close(); return; }
      try {
        const progress = Math.max(0, Math.min(1, (elapsed - 800) / 3200));
        renderer?.render(-.08 + progress * 1.24, elapsed / 1000);
        frame = requestAnimationFrame(draw);
      } catch (error) { fail(error); }
    };
    timer = window.setTimeout(close, 4800);
    try {
      element.showModal();
      renderer = createBurningIntro(surface);
      renderer.render(-.08, 0);
      frame = requestAnimationFrame(draw);
    } catch (error) { fail(error); }
    preference.addEventListener("change", onPreference);
    surface.addEventListener("webglcontextlost", onContextLost);
    window.addEventListener("resize", onResize);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame); window.clearTimeout(timer);
      renderer?.dispose();
      preference.removeEventListener("change", onPreference);
      surface.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("resize", onResize);
      element.close();
    };
  }, [close, finished]);

  if (finished) return null;
  return <dialog ref={dialog} className="site-intro" data-fallback={fallback} aria-label={c.introTitle} onCancel={event => { event.preventDefault(); close(); }}>
    <canvas ref={canvas} aria-hidden="true" />
    <div className="site-intro-static" aria-hidden="true">Tecsecure</div>
    <span className="sr-only">{c.introTitle}</span>
    <button className="site-intro-skip" type="button" onClick={close} autoFocus>{c.skipIntro}<span aria-hidden="true"> →</span></button>
  </dialog>;
}
