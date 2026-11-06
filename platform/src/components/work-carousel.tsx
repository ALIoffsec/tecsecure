"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MediaLightbox } from "./media-lightbox";
import { useSitePreferences } from "./site-preferences";
import { siteCopy } from "@/lib/site-copy";

export type WorkPost = { id: string; title: string; description: string; media: unknown };
type Slide = { key: string; mediaId: string; postId: string; title: string; description: string };

const AUTOPLAY_MS = 5200;
const STIFFNESS = 95;
const DAMPING = 17;

function workSlides(posts: WorkPost[]): Slide[] {
  return posts.flatMap(post => (Array.isArray(post.media) ? post.media.filter((id): id is string => typeof id === "string") : [])
    .map((mediaId, index) => ({ key: `${post.id}:${index}`, mediaId, postId: post.id, title: post.title, description: post.description })));
}

/** Shortest signed distance on the loop, so the strip never visibly rewinds. */
function loopOffset(index: number, position: number, count: number) {
  const raw = ((index - position) % count + count) % count;
  return raw > count / 2 ? raw - count : raw;
}

/** One function places a slide for the first render, for dragging and for the spring. */
function slideStyle(offset: number) {
  const distance = Math.abs(offset);
  const side = Math.sign(offset);
  const reach = (1 - Math.pow(.56, distance)) / (1 - .56);
  const visible = distance < 2.7;
  return {
    transform: `translate3d(${side * reach * 58}%, 0, ${-Math.min(distance, 3) * 170}px) rotateY(${-Math.max(-1, Math.min(1, offset)) * 16}deg) scale(${1 - Math.min(distance, 3) * .05})`,
    opacity: visible ? String(Math.max(0, 1 - Math.max(0, distance - 1.7))) : "0",
    zIndex: String(100 - Math.round(distance * 10)),
    visibility: (visible ? "visible" : "hidden") as "visible" | "hidden",
    dim: String(Math.min(1, distance) * .55)
  };
}

function SlideImage({ id, alt, eager }: { id: string; alt: string; eager: boolean }) {
  const [isVideo, setIsVideo] = useState(false);
  const source = `/api/media/${id}`;
  if (isVideo) return <video src={source} muted loop playsInline preload="metadata" autoPlay aria-label={alt || undefined} />;
  return <img src={source} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} onError={() => setIsVideo(true)} />;
}

export function WorkCarousel({ posts, showLink = false }: { posts: WorkPost[]; showLink?: boolean }) {
  const { locale } = useSitePreferences();
  const c = siteCopy[locale].work;
  const allSlides = useMemo(() => workSlides(posts), [posts]);
  const projects = useMemo(() => posts.filter(post => allSlides.some(slide => slide.postId === post.id)), [posts, allSlides]);
  const [project, setProject] = useState<string | null>(null);
  const slides = useMemo(() => project ? allSlides.filter(slide => slide.postId === project) : allSlides, [allSlides, project]);
  const count = slides.length;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [zoom, setZoom] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLElement | null)[]>([]);
  const thumbs = useRef<HTMLDivElement>(null);
  const motion = useRef({ position: 0, velocity: 0, target: 0, frame: 0, last: 0, reduced: false });
  const drag = useRef<{ pointer: number; startX: number; startPosition: number; lastX: number; lastTime: number; speed: number; moved: boolean } | null>(null);

  const paint = useCallback(() => {
    items.current.forEach((element, index) => {
      if (!element) return;
      const style = slideStyle(loopOffset(index, motion.current.position, count));
      element.style.transform = style.transform;
      element.style.opacity = style.opacity;
      element.style.zIndex = style.zIndex;
      element.style.visibility = style.visibility;
      element.style.setProperty("--dim", style.dim);
    });
  }, [count]);

  const run = useCallback(() => {
    const state = motion.current;
    if (state.frame) return;
    state.last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(.032, (now - state.last) / 1000);
      state.last = now;
      if (!drag.current) {
        state.velocity += ((state.target - state.position) * STIFFNESS - state.velocity * DAMPING) * dt;
        state.position += state.velocity * dt;
      }
      paint();
      if (drag.current || Math.abs(state.target - state.position) > .0008 || Math.abs(state.velocity) > .0008) {
        state.frame = requestAnimationFrame(tick);
      } else {
        state.position = state.target;
        state.velocity = 0;
        state.frame = 0;
        paint();
      }
    };
    state.frame = requestAnimationFrame(tick);
  }, [paint]);

  const goTo = useCallback((target: number) => {
    const state = motion.current;
    state.target = target;
    setActive(((target % count) + count) % count);
    if (state.reduced) {
      state.position = target;
      state.velocity = 0;
      paint();
      return;
    }
    run();
  }, [count, paint, run]);

  const step = useCallback((delta: number) => goTo(Math.round(motion.current.target) + delta), [goTo]);
  /** Moves to a slide index by the short way round. */
  const showIndex = useCallback((index: number) => {
    const current = Math.round(motion.current.target);
    goTo(current + loopOffset(index, current, count));
  }, [count, goTo]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    motion.current.reduced = preference.matches;
    setPlaying(!preference.matches);
    const onPreference = () => { motion.current.reduced = preference.matches; if (preference.matches) setPlaying(false); };
    const onVisibility = () => setPageVisible(!document.hidden);
    onVisibility();
    preference.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .35 });
    if (stage.current) observer.observe(stage.current);
    const state = motion.current;
    return () => { observer.disconnect(); preference.removeEventListener("change", onPreference); document.removeEventListener("visibilitychange", onVisibility); cancelAnimationFrame(state.frame); state.frame = 0; };
  }, []);

  // Choosing a project starts its photos from the first one.
  useEffect(() => {
    const state = motion.current;
    state.position = state.target = state.velocity = 0;
    setActive(0);
    paint();
  }, [project, paint]);

  const running = playing && !hovered && !focused && !zoom && inView && pageVisible && count > 1;
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => step(1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [running, active, step]);

  useEffect(() => {
    const strip = thumbs.current;
    const thumb = strip?.children[active];
    if (!strip || !(thumb instanceof HTMLElement)) return;
    strip.scrollTo({ left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2, behavior: motion.current.reduced ? "auto" : "smooth" });
  }, [active]);

  if (!count) return null;
  const current = slides[active] ?? slides[0];
  const pad = (value: number) => String(value).padStart(2, "0");

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (count < 2 || event.button !== 0) return;
    const state = motion.current;
    drag.current = { pointer: event.pointerId, startX: event.clientX, startPosition: state.position, lastX: event.clientX, lastTime: performance.now(), speed: 0, moved: false };
    run();
  }
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.pointer !== event.pointerId) return;
    const width = items.current[active]?.offsetWidth ?? stage.current?.clientWidth ?? 1;
    const total = event.clientX - gesture.startX;
    if (!gesture.moved && Math.abs(total) > 6) {
      gesture.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (!gesture.moved) return;
    const now = performance.now();
    gesture.speed = (event.clientX - gesture.lastX) / Math.max(1, now - gesture.lastTime);
    gesture.lastX = event.clientX;
    gesture.lastTime = now;
    motion.current.position = gesture.startPosition - total / (width * .72);
  }
  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.pointer !== event.pointerId) return;
    drag.current = null;
    if (!gesture.moved) return;
    const width = items.current[active]?.offsetWidth ?? 1;
    const flick = -gesture.speed * 240 / width;
    motion.current.velocity = -gesture.speed * 1000 / (width * .72);
    goTo(Math.round(motion.current.position + Math.max(-1, Math.min(1, flick))));
    setPlaying(false);
  }
  function onSlideClick(index: number) {
    if (index === active) { setZoom(true); return; }
    showIndex(index);
  }

  return <div className="work-carousel" role="region" aria-roledescription="carousel" aria-label={c.title} data-autoplay={running ? "running" : "paused"}
    onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}
    onFocusCapture={event => setFocused(event.target.matches(":focus-visible"))} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => {
      if (zoom) return;
      if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    }}>
    {projects.length > 1 && <div className="work-filter" role="group" aria-label={c.title}>
      <button type="button" aria-pressed={!project} onClick={() => setProject(null)}>{c.all}<small>{allSlides.length}</small></button>
      {projects.map(item => <button type="button" key={item.id} aria-pressed={project === item.id} onClick={() => setProject(item.id)}>{item.title}<small>{allSlides.filter(slide => slide.postId === item.id).length}</small></button>)}
    </div>}

    <div className="work-stage" ref={stage} data-single={count === 1} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
      <img className="work-ambient" key={current.key} src={`/api/media/${current.mediaId}`} alt="" aria-hidden="true" draggable={false} />
      <div className="work-track">
        {slides.map((slide, index) => {
          const style = slideStyle(loopOffset(index, active, count));
          const isActive = index === active;
          return <button type="button" className="work-slide" key={slide.key} ref={element => { items.current[index] = element; }}
            tabIndex={isActive ? 0 : -1} aria-hidden={!isActive} aria-label={`${c.open}: ${slide.title} — ${index + 1} / ${count}`} data-active={isActive}
            style={{ transform: style.transform, opacity: style.opacity, zIndex: style.zIndex, visibility: style.visibility, "--dim": style.dim } as React.CSSProperties}
            onClick={() => onSlideClick(index)}>
            <SlideImage id={slide.mediaId} alt={isActive ? slide.title : ""} eager={Math.abs(loopOffset(index, active, count)) < 2} />
            <span className="work-slide-zoom" aria-hidden="true">⤢</span>
          </button>;
        })}
      </div>
    </div>

    <div className="work-panel">
      <div className="work-caption" key={current.key} aria-live={running ? "off" : "polite"}>
        <span className="work-count"><b>{pad(active + 1)}</b> / {pad(count)}</span>
        <h3>{current.title}</h3>
        <p>{current.description}</p>
      </div>
      {count > 1 && <div className="work-controls">
        <button type="button" className="work-arrow" aria-label={c.prev} onClick={() => { setPlaying(false); step(-1); }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.75 19.5 8.25 12l7.5-7.5" /></svg></button>
        <button type="button" className="work-arrow work-play" aria-pressed={!playing} aria-label={playing ? c.pause : c.play} onClick={() => setPlaying(value => !value)}>
          <svg className="work-ring" viewBox="0 0 44 44" aria-hidden="true"><circle key={`${active}-${running}`} cx="22" cy="22" r="20" /></svg>
          <svg viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M9 6v12M15 6v12" /> : <path d="M8 5.5v13l10.5-6.5z" />}</svg>
        </button>
        <button type="button" className="work-arrow" aria-label={c.next} onClick={() => { setPlaying(false); step(1); }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg></button>
      </div>}
    </div>

    {count > 1 && <div className="work-thumbs" ref={thumbs} role="group" aria-label={c.title}>
      {slides.map((slide, index) => <button type="button" className="work-thumb" key={slide.key} aria-current={index === active} aria-label={`${slide.title} — ${index + 1}`} onClick={() => { setPlaying(false); showIndex(index); }}>
        <img src={`/api/media/${slide.mediaId}`} alt="" loading="lazy" decoding="async" draggable={false} onError={event => { event.currentTarget.style.visibility = "hidden"; }} />
      </button>)}
    </div>}

    {showLink && <div className="work-more"><Link className="button secondary" href="/work">{c.seeAll} →</Link></div>}
    {zoom && <MediaLightbox source={`/api/media/${current.mediaId}`} title={current.title} counter={`${active + 1} / ${count}`} prevLabel={c.prev} nextLabel={c.next}
      onPrev={count > 1 ? () => step(-1) : undefined} onNext={count > 1 ? () => step(1) : undefined} onClose={() => setZoom(false)} />}
  </div>;
}
