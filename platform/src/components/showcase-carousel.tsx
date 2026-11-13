"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSitePreferences } from "./site-preferences";
import { motionPreference } from "@/lib/motion";
import { homeCopy } from "@/lib/home-copy";

const STEP_MS = 3000;
const TOUCH_HOLD_MS = 8000;

/**
 * A row of cards that moves one card every three seconds and wraps to the start. It stops while the pointer
 * is over it, while something inside has keyboard focus, for eight seconds after a finger touches it, while
 * it is off screen or the tab is hidden, and entirely when motion is switched off in the site menu.
 * Fingers swipe it natively (scroll-snap); arrows and dots work everywhere.
 */
export function ShowcaseCarousel({ kind, label, children }: { kind: "services" | "courses" | "products"; label: string; children: ReactNode }) {
  const { locale } = useSitePreferences();
  const c = homeCopy[locale];
  const slides = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [positions, setPositions] = useState(slides.length);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touchHold, setTouchHold] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [motionOff, setMotionOff] = useState(true);
  const touchTimer = useRef<number | undefined>(undefined);

  /** Distance from one card's start to the next one's. */
  const stepWidth = useCallback(() => {
    const items = track.current?.children;
    if (!items || items.length < 2) return track.current?.clientWidth ?? 1;
    return (items[1] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft;
  }, []);

  // How many start positions exist: with three cards on screen, eight cards give six stops.
  const measure = useCallback(() => {
    const element = track.current;
    if (!element) return;
    const step = stepWidth();
    const perView = Math.max(1, Math.round((element.clientWidth + 1) / step));
    setPositions(Math.max(1, slides.length - perView + 1));
  }, [slides.length, stepWidth]);

  useEffect(() => {
    measure();
    const element = track.current;
    if (!element) return;
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    return () => resize.disconnect();
  }, [measure]);

  const goTo = useCallback((target: number) => {
    const element = track.current;
    if (!element) return;
    const wrapped = target >= positions ? 0 : target < 0 ? positions - 1 : target;
    element.scrollTo({ left: wrapped * stepWidth(), behavior: motionPreference().matches ? "auto" : "smooth" });
    setIndex(wrapped);
  }, [positions, stepWidth]);

  // Swiping or scrolling by hand moves the dots with it.
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 2;
        setIndex(atEnd ? positions - 1 : Math.min(positions - 1, Math.round(element.scrollLeft / stepWidth())));
      });
    };
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => { element.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [positions, stepWidth]);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .35 });
    observer.observe(element);
    const onVisibility = () => setPageHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    const preference = motionPreference();
    const onMotion = () => setMotionOff(preference.matches);
    onMotion();
    preference.addEventListener("change", onMotion);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      preference.removeEventListener("change", onMotion);
      window.clearTimeout(touchTimer.current);
    };
  }, []);

  const running = !motionOff && visible && !pageHidden && !hovered && !focused && !touchHold && positions > 1;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => goTo(index + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [running, index, goTo]);

  const holdForTouch = () => {
    setTouchHold(true);
    window.clearTimeout(touchTimer.current);
    touchTimer.current = window.setTimeout(() => setTouchHold(false), TOUCH_HOLD_MS);
  };

  return <div className={`showcase-carousel is-${kind}`} role="region" aria-roledescription={c.carouselLabel} aria-label={label}
    onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
    onPointerLeave={event => { if (event.pointerType === "mouse") setHovered(false); }}
    onTouchStart={holdForTouch}
    onFocus={event => { if ((event.target as HTMLElement).matches(":focus-visible")) setFocused(true); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
    <div className="showcase-track" ref={track}>
      {slides.map((slide, slideIndex) => <div className="showcase-slide" key={slideIndex}>{slide}</div>)}
    </div>
    {positions > 1 && <div className="showcase-controls">
      <button type="button" className="work-arrow showcase-arrow" aria-label={c.carouselPrev} onClick={() => goTo(index - 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.75 19.5 8.25 12l7.5-7.5" /></svg></button>
      <div className="showcase-dots">
        {Array.from({ length: positions }, (_, dot) => <button key={dot} type="button" className="showcase-dot" aria-current={dot === index ? "true" : undefined}
          aria-label={`${dot + 1} — ${c.carouselGo}`} onClick={() => goTo(dot)}>
          {dot === index && running && <span className="showcase-dot-fill" key={`${index}-run`} style={{ animationDuration: `${STEP_MS}ms` }} />}
        </button>)}
      </div>
      <button type="button" className="work-arrow showcase-arrow" aria-label={c.carouselNext} onClick={() => goTo(index + 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg></button>
    </div>}
  </div>;
}
