"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import { MediaLightbox } from "./media-lightbox";
import { journeyCopy } from "@/lib/journey-copy";

export function MediaUploader({ scope, value, onChange }: {
  scope: "CONTENT" | "PORTFOLIO" | "SERVICES" | "PRODUCTS" | "NEWS" | "WALLET";
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const { t } = useSitePreferences();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.set("scope", scope);
        form.set("file", file);
        const response = await fetch("/api/media", { method: "POST", body: form });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
        added.push(result.asset.id as string);
      }
      onChange([...value, ...added]);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field">
      <label>{t("mediaAttachments")}</label>
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" multiple disabled={busy} onChange={(event) => { void upload(event.currentTarget.files); event.currentTarget.value = ""; }} />
      <p className="small muted">{t("mediaUploadLimits")}</p>
      <ToastMessage message={error} variant="error" />
      {busy && <span className="small muted">{t("uploadingMedia")}</span>}
      {!!value.length && <div className="media-preview-grid">{value.map((id) => (
        <div className="media-preview-item" key={id}>
          <a href={`/api/media/${id}`} target="_blank" rel="noreferrer">{t("viewMedia")}</a>
          <button className="button danger small" type="button" onClick={() => onChange(value.filter((item) => item !== id))}>{t("remove")}</button>
        </div>
      ))}</div>}
    </div>
  );
}

export function MediaGallery({ media, title, marquee = false, firstOnly = false, preserveAspectRatio = false, variant = "default" }: {
  media: unknown;
  title: string;
  marquee?: boolean;
  firstOnly?: boolean;
  preserveAspectRatio?: boolean;
  variant?: "default" | "product-card" | "product-detail";
}) {
  if (!Array.isArray(media)) return null;
  const ids = media.filter((value): value is string => typeof value === "string");
  if (!ids.length) return null;
  if (marquee) return <MediaCarousel ids={ids} title={title} />;
  return (
    <div className={`media-gallery${variant !== "default" ? ` media-gallery-${variant}` : ""}`}>
      {(firstOnly ? ids.slice(0, 1) : ids).map((id) => <MediaPreview key={id} id={id} title={title} preserveAspectRatio={preserveAspectRatio} />)}
    </div>
  );
}

function MediaCarousel({ ids, title }: { ids: string[]; title: string }) {
  const { locale } = useSitePreferences();
  const c = journeyCopy[locale];
  const track = useRef<HTMLDivElement>(null);
  const trackId = useId();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(preference.matches);
    setPlaying(!preference.matches);
    const onPreference = () => { setReducedMotion(preference.matches); if (preference.matches) setPlaying(false); };
    const onVisibility = () => setPageVisible(!document.hidden);
    onVisibility();
    preference.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    if (track.current) observer.observe(track.current);
    return () => { observer.disconnect(); preference.removeEventListener("change", onPreference); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);
  const goTo = useCallback((index: number) => {
    const element = track.current;
    if (!element) return;
    const target = (index + ids.length) % ids.length;
    const slide = element.children[target];
    if (!(slide instanceof HTMLElement)) return;
    const left = slide.getBoundingClientRect().left - element.getBoundingClientRect().left + element.scrollLeft;
    element.scrollTo({ left, behavior: reducedMotion || index < 0 || index >= ids.length ? "instant" : "smooth" });
  }, [ids.length, reducedMotion]);
  const running = playing && !hovered && !focused && !zoomOpen && inView && pageVisible && ids.length > 1;
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => goTo(active + 1), 3600);
    return () => window.clearTimeout(timer);
  }, [running, active, goTo]);
  function move(index: number) { setPlaying(false); goTo(index); }
  return <div className="portfolio-carousel" role="region" aria-label={`${c.galleryLabel}: ${title}`} data-autoplay={running ? "running" : "paused"}
    onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}
    onFocusCapture={event => setFocused(event.target.matches(":focus-visible"))} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onPlayCapture={() => setPlaying(false)}>
    {ids.length > 1 && <button type="button" className="sr-only gallery-accessible-control" aria-controls={trackId}
      onClick={() => { setPlaying(value => !value); setFocused(false); }}>{playing ? c.galleryPause : c.galleryPlay}</button>}
    <div className="gallery-scroll" id={trackId} ref={track} tabIndex={0} role="group" aria-label={c.galleryLabel}
      onTouchStart={event => {
        const touch = event.touches[0];
        touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
      }}
      onTouchMove={event => {
        const touch = event.touches[0];
        if (!touch || !touchStart.current) return;
        const dx = Math.abs(touch.clientX - touchStart.current.x);
        const dy = Math.abs(touch.clientY - touchStart.current.y);
        if (dx > 8 && dx > dy) { setPlaying(false); touchStart.current = null; }
      }}
      onTouchEnd={() => { touchStart.current = null; }}
      onTouchCancel={() => { touchStart.current = null; }}
      onWheel={() => setPlaying(false)}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        const index = event.key === "ArrowRight" ? active + 1 : event.key === "ArrowLeft" ? active - 1 : event.key === "Home" ? 0 : event.key === "End" ? ids.length - 1 : null;
        if (index !== null) { event.preventDefault(); move(index); }
      }}
      onScroll={() => {
        const element = track.current;
        if (!element) return;
        const left = element.getBoundingClientRect().left;
        let nearest = 0;
        let distance = Infinity;
        Array.from(element.children).forEach((slide, index) => {
          const delta = Math.abs(slide.getBoundingClientRect().left - left);
          if (delta < distance) { distance = delta; nearest = index; }
        });
        setActive(nearest);
      }}>
      {ids.map((id, index) => <div className="gallery-slide" key={id} role="group" data-active={index === active} aria-label={`${index + 1} / ${ids.length}`}>
        <MediaPreview id={id} title={`${title} — ${index + 1}`} carousel onZoomChange={setZoomOpen} />
      </div>)}
    </div>
    {ids.length > 1 && <div className="feature-gallery-progress" aria-hidden="true"><i style={{ width: `${(active + 1) / ids.length * 100}%` }} /></div>}
  </div>;
}

function MediaPreview({ id, title, carousel = false, preserveAspectRatio = false, onZoomChange }: {
  id: string;
  title: string;
  carousel?: boolean;
  preserveAspectRatio?: boolean;
  onZoomChange?: (open: boolean) => void;
}) {
  const [mime, setMime] = useState("");
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(false);
  const { locale } = useSitePreferences();
  const copy = journeyCopy[locale];
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const source = `/api/media/${id}`;
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setFailed(false);
    fetch(source, { method: "HEAD", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Media ${response.status}`);
        const type = response.headers.get("content-type") ?? "";
        if (!/^(image|video)\//.test(type)) throw new Error("Unsupported media");
        if (active) setMime(type);
      })
      .catch((error: unknown) => {
        if (active) { console.error("Media preview failed", source, error); setFailed(true); }
      });
    return () => { active = false; controller.abort(); };
  }, [source, attempt]);
  if (failed) return <div className="product-media-error" role="status"><p>{copy.mediaError}</p><button type="button" className="button secondary" onClick={() => setAttempt(value => value + 1)}>{copy.retry}</button></div>;
  if (!mime) return <div className="media-preview-frame" aria-busy="true" />;
  const itemStyle = preserveAspectRatio ? { aspectRatio: String(aspectRatio) } : undefined;
  if (mime.startsWith("video/")) return (
    <div className="media-preview-frame" style={itemStyle}>
      <video className="media-preview" src={source} controls preload="metadata" aria-label={title} onError={() => setFailed(true)} onLoadedMetadata={(event) => {
        const { videoWidth, videoHeight } = event.currentTarget;
        if (videoWidth && videoHeight) setAspectRatio(videoWidth / videoHeight);
      }} />
    </div>
  );
  if (mime.startsWith("image/")) return (
    <div className="media-preview-frame" style={itemStyle}>
      <button className="media-zoom-trigger" type="button" aria-label={`${copy.zoom}: ${title}`} onClick={() => { setZoom(true); onZoomChange?.(true); }}>
      <Image
        className="media-preview"
        src={source}
        alt={title}
        fill
        sizes={carousel ? "(max-width: 640px) 85vw, 360px" : "(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 560px"}
        quality={75}
        onError={() => setFailed(true)}
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          if (naturalWidth && naturalHeight) setAspectRatio(naturalWidth / naturalHeight);
        }}
      />
      </button>
      {zoom && <MediaLightbox source={source} title={title} onClose={() => { setZoom(false); onZoomChange?.(false); }} />}
    </div>
  );
  return null;
}
