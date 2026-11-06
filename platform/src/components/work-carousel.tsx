"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaLightbox } from "./media-lightbox";
import { useSitePreferences } from "./site-preferences";
import { featureCopy } from "@/lib/feature-copy";
import { journeyCopy } from "@/lib/journey-copy";

export type WorkPost = { id: string; title: string; description: string; media: unknown };
type Slide = { key: string; mediaId: string | null; title: string; description: string };
type View = { active: number; previous: number | null; returning: number | null; direction: 1 | -1 };

const AUTOPLAY_MS = 6000;
const SETTLE_MS = 850;
const VISIBLE_RAIL = 4;

/** Every photo of a finished job is its own slide, so a single post with many photos still rotates. */
function workSlides(posts: WorkPost[]): Slide[] {
  return posts.flatMap((post): Slide[] => {
    const ids = Array.isArray(post.media) ? post.media.filter((id): id is string => typeof id === "string") : [];
    const base = { title: post.title, description: post.description };
    return ids.length ? ids.map((mediaId, index) => ({ ...base, key: `${post.id}:${index}`, mediaId })) : [{ ...base, key: post.id, mediaId: null }];
  });
}

function SlideMedia({ id, alt, eager, playing }: { id: string | null; alt: string; eager: boolean; playing: boolean }) {
  const [isVideo, setIsVideo] = useState(false);
  if (!id) return <span className="work-card-empty" aria-hidden="true" />;
  const source = `/api/media/${id}`;
  if (isVideo) return <video src={source} muted loop playsInline preload="metadata" autoPlay={playing} aria-label={alt || undefined} />;
  return <img src={source} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} onError={() => setIsVideo(true)} />;
}

export function WorkCarousel({ posts }: { posts: WorkPost[] }) {
  const { locale } = useSitePreferences();
  const c = featureCopy[locale];
  const gallery = journeyCopy[locale];
  const slides = workSlides(posts);
  const count = slides.length;
  const [view, setView] = useState<View>({ active: 0, previous: null, returning: null, direction: 1 });
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [zoom, setZoom] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<number | null>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPlaying(!preference.matches);
    const onPreference = () => { if (preference.matches) setPlaying(false); };
    const onVisibility = () => setPageVisible(!document.hidden);
    onVisibility();
    preference.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .3 });
    if (stage.current) observer.observe(stage.current);
    return () => { observer.disconnect(); preference.removeEventListener("change", onPreference); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  const move = useCallback((next: number, direction: 1 | -1) => {
    setView(current => {
      const target = (next + count) % count;
      return target === current.active ? current : { active: target, previous: current.active, returning: null, direction };
    });
  }, [count]);

  // The old slide stays full size underneath until the new one has grown over it, then rejoins the rail.
  useEffect(() => {
    if (view.previous === null) return;
    const timer = window.setTimeout(() => setView(current => ({ ...current, previous: null, returning: current.previous })), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [view.previous, view.active]);

  const running = playing && !hovered && !focused && !zoom && inView && pageVisible && count > 1;
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => move(view.active + 1, 1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [running, view.active, move]);

  if (!count) return null;
  const current = slides[view.active];
  const railOf = (index: number, active: number) => (index - active - 1 + count) % count;
  const label = (value: number) => String(value).padStart(2, "0");

  return <div className="work-carousel" role="region" aria-roledescription="carousel" aria-label={gallery.galleryLabel} data-autoplay={running ? "running" : "paused"} data-single={count === 1}
    onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}
    onFocusCapture={event => setFocused(event.target.matches(":focus-visible"))} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => {
      if (event.key === "ArrowRight") { event.preventDefault(); move(view.active + 1, 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move(view.active - 1, -1); }
    }}>
    <div className="work-stage" ref={stage}
      onPointerDown={event => { swipeStart.current = event.pointerType === "mouse" ? null : event.clientX; }}
      onPointerUp={event => {
        if (swipeStart.current === null) return;
        const distance = event.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(distance) > 50) move(view.active + (distance < 0 ? 1 : -1), distance < 0 ? 1 : -1);
      }}>
      {slides.map((slide, index) => {
        const isActive = index === view.active;
        const isLeaving = index === view.previous;
        const rail = railOf(index, view.active);
        const before = view.previous === null ? rail : railOf(index, view.previous);
        const wrapped = view.previous !== null && (view.direction === 1 ? rail > before : rail < before);
        const state = isActive ? "active" : isLeaving ? "leaving" : "rail";
        const reachable = state === "rail" && rail < VISIBLE_RAIL;
        return <div key={slide.key} className="work-card" data-state={state} data-returning={state === "rail" && (index === view.returning || wrapped)} data-hidden={state === "rail" && !reachable} style={{ "--rail": rail } as React.CSSProperties}>
          <SlideMedia id={slide.mediaId} alt={isActive ? slide.title : ""} eager={isActive || rail < 2} playing={isActive} />
          {state === "rail" && <button type="button" className="work-card-open" tabIndex={reachable ? 0 : -1} aria-hidden={!reachable} aria-label={`${slide.title} — ${index + 1} / ${count}`} onClick={() => move(index, 1)}>
            <span className="work-card-caption"><i aria-hidden="true" /><strong>{slide.title}</strong></span>
          </button>}
        </div>;
      })}
      <div className="work-details" key={view.active} aria-live={running ? "off" : "polite"}>
        <span className="work-details-place"><i aria-hidden="true" />{label(view.active + 1)} / {label(count)}</span>
        <h3>{current.title}</h3>
        <p>{current.description}</p>
        {current.mediaId && <button type="button" className="button secondary work-zoom" onClick={() => setZoom(true)}>{c.workOpen}</button>}
      </div>
      {count > 1 && <div className="work-controls">
        <button type="button" className="work-arrow" aria-label={c.workPrev} onClick={() => move(view.active - 1, -1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.75 19.5 8.25 12l7.5-7.5" /></svg></button>
        <button type="button" className="work-arrow" aria-label={c.workNext} onClick={() => move(view.active + 1, 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg></button>
        <button type="button" className="work-arrow" aria-pressed={!playing} aria-label={playing ? gallery.galleryPause : gallery.galleryPlay} onClick={() => setPlaying(value => !value)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M9 5v14M15 5v14" /> : <path d="M8 5.5v13l10.5-6.5z" />}</svg>
        </button>
        <span className="work-progress" aria-hidden="true"><i style={{ width: `${(view.active + 1) / count * 100}%` }} /></span>
        <span className="work-number" aria-hidden="true" key={view.active}>{label(view.active + 1)}</span>
      </div>}
      {count > 1 && <span className="work-timer" aria-hidden="true"><i key={view.active} /></span>}
    </div>
    {zoom && current.mediaId && <MediaLightbox source={`/api/media/${current.mediaId}`} title={current.title} onClose={() => setZoom(false)} />}
  </div>;
}
