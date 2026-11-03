"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
  return (
    <div className={`${marquee ? "gallery-scroll" : "media-gallery"}${variant !== "default" ? ` media-gallery-${variant}` : ""}`}>
      {marquee ? (
        ids.map(id => <MediaPreview key={id} id={id} title={title} />)
      ) : (firstOnly ? ids.slice(0, 1) : ids).map((id) => <MediaPreview key={id} id={id} title={title} preserveAspectRatio={preserveAspectRatio} />)}
    </div>
  );
}

function MediaPreview({ id, title, marquee = false, decorative = false, preserveAspectRatio = false }: {
  id: string;
  title: string;
  marquee?: boolean;
  decorative?: boolean;
  preserveAspectRatio?: boolean;
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
  const itemClassName = marquee ? "media-marquee-item" : undefined;
  const itemStyle = marquee || preserveAspectRatio ? { aspectRatio: String(aspectRatio) } : undefined;
  if (mime.startsWith("video/")) return (
    <div className={itemClassName} style={itemStyle} role={marquee ? "listitem" : undefined} aria-hidden={decorative || undefined}>
      <video className={marquee ? "media-preview media-marquee-preview" : "media-preview"} src={source} controls preload="metadata" aria-label={decorative ? undefined : title} onLoadedMetadata={(event) => {
        const { videoWidth, videoHeight } = event.currentTarget;
        if (videoWidth && videoHeight) setAspectRatio(videoWidth / videoHeight);
      }} />
    </div>
  );
  if (mime.startsWith("image/")) return (
    <div className={itemClassName ?? "media-preview-frame"} style={itemStyle} role={marquee ? "listitem" : undefined} aria-hidden={decorative || undefined}>
      <button className="media-zoom-trigger" type="button" aria-label={`${copy.zoom}: ${title}`} onClick={() => setZoom(true)}>
      <Image
        className={marquee ? "media-preview media-marquee-preview" : "media-preview"}
        src={source}
        alt={decorative ? "" : title}
        fill
        sizes={marquee ? "(max-width: 640px) 75vw, (max-width: 1200px) 42vw, 480px" : "(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 560px"}
        quality={75}
        onError={() => setFailed(true)}
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          if (naturalWidth && naturalHeight) setAspectRatio(naturalWidth / naturalHeight);
        }}
      />
      </button>
      {zoom && <MediaLightbox source={source} title={title} onClose={() => setZoom(false)} />}
    </div>
  );
  return null;
}
