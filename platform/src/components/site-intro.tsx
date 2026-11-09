"use client";

import { motionPreference } from "@/lib/motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { burnProgress, createBurningIntro, INTRO_MS } from "@/lib/burning-intro";
import { usePathname } from "next/navigation";
import { featureCopy } from "@/lib/feature-copy";
import { useSitePreferences } from "./site-preferences";

export function SiteIntro() {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [finished, setFinished] = useState(false);
  const [fallback, setFallback] = useState(false);
  const { locale } = useSitePreferences();
  const c = featureCopy[locale];
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const close = useCallback(() => {
    dialog.current?.close();
    delete document.documentElement.dataset.tecIntro;
    setFinished(true);
  }, []);

  useEffect(() => {
    // The opening plays once per visit: when the home page itself is opened (typed address, reload, new tab).
    // The head script decides that before the page paints. Moving to home from inside the site, or going back to it,
    // does not play it again; leaving home while it plays ends it.
    if (previousPath.current !== pathname && document.documentElement.dataset.tecIntro) close();
    previousPath.current = pathname;
  }, [close, pathname]);

  useEffect(() => {
    const element = dialog.current;
    const surface = canvas.current;
    const preference = motionPreference();
    if (finished || !element || !surface) return;
    document.dispatchEvent(new Event("tecsecure:intro-ready"));
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
      if (elapsed >= INTRO_MS) { close(); return; }
      try {
        renderer?.render(burnProgress(elapsed / INTRO_MS), elapsed / 1000);
        frame = requestAnimationFrame(draw);
      } catch (error) { fail(error); }
    };
    timer = window.setTimeout(close, INTRO_MS + 1000);
    try {
      element.showModal();
      renderer = createBurningIntro(surface);
      renderer.render(0, 0);
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
  </dialog>;
}
