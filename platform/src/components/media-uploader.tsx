"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import { MediaLightbox } from "./media-lightbox";
import { journeyCopy } from "@/lib/journey-copy";
import { siteCopy } from "@/lib/site-copy";

export function MediaUploader({ scope, value, onChange, reorderable = false, hideLabel = false }: {
  scope: "CONTENT" | "PORTFOLIO" | "SERVICES" | "PRODUCTS" | "NEWS" | "WALLET";
  value: string[];
  onChange: (ids: string[]) => void;
  reorderable?: boolean;
  hideLabel?: boolean;
}) {
  const { t, locale } = useSitePreferences();
  const common = siteCopy[locale].common;
  const proofOnly = scope === "WALLET";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const move = (index: number, delta: number) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };

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
      {!hideLabel && <label>{proofOnly ? common.proofLabel : t("mediaAttachments")}</label>}
      <div className="file-pick">
        <span className="button secondary">{proofOnly ? common.chooseImage : common.chooseFiles}</span>
        <input type="file" aria-label={proofOnly ? common.proofLabel : t("mediaAttachments")} accept={proofOnly ? "image/jpeg,image/png,image/webp" : "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"} multiple={!proofOnly} disabled={busy} onChange={(event) => { void upload(event.currentTarget.files); event.currentTarget.value = ""; }} />
      </div>
      <p className="small muted">{proofOnly ? common.proofHint : t("mediaUploadLimits")}</p>
      <ToastMessage message={error} variant="error" />
      {busy && <span className="small muted">{t("uploadingMedia")}</span>}
      {!!value.length && <ul className="media-thumb-grid">{value.map((id, index) => (
        <li className="media-thumb" key={id}>
          <a href={`/api/media/${id}`} target="_blank" rel="noreferrer" title={t("viewMedia")}>
            <MediaThumb id={id} />
          </a>
          {reorderable && index === 0 && <span className="media-thumb-cover">★</span>}
          <div className="media-thumb-actions">
            {reorderable && index > 0 && <button type="button" aria-label="←" title="←" onClick={() => move(index, -1)}>←</button>}
            {reorderable && index < value.length - 1 && <button type="button" aria-label="→" title="→" onClick={() => move(index, 1)}>→</button>}
            <button type="button" className="is-danger" aria-label={t("remove")} title={t("remove")} onClick={() => onChange(value.filter((item) => item !== id))}>×</button>
          </div>
        </li>
      ))}</ul>}
    </div>
  );
}

function MediaThumb({ id }: { id: string }) {
  const [isVideo, setIsVideo] = useState(false);
  if (isVideo) return <video src={`/api/media/${id}`} muted preload="metadata" />;
  return <img src={`/api/media/${id}`} alt="" loading="lazy" onError={() => setIsVideo(true)} />;
}

export function MediaGallery({ media, title, firstOnly = false, preserveAspectRatio = false, variant = "default" }: {
  media: unknown;
  title: string;
  firstOnly?: boolean;
  preserveAspectRatio?: boolean;
  variant?: "default" | "product-card" | "product-detail";
}) {
  if (!Array.isArray(media)) return null;
  const ids = media.filter((value): value is string => typeof value === "string");
  if (!ids.length) return null;
  return (
    <div className={`media-gallery${variant !== "default" ? ` media-gallery-${variant}` : ""}`}>
      {(firstOnly ? ids.slice(0, 1) : ids).map((id) => <MediaPreview key={id} id={id} title={title} preserveAspectRatio={preserveAspectRatio} />)}
    </div>
  );
}

function MediaPreview({ id, title, preserveAspectRatio = false }: {
  id: string;
  title: string;
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
      <button className="media-zoom-trigger" type="button" aria-label={`${copy.zoom}: ${title}`} onClick={() => { setZoom(true);  }}>
      <Image
        className="media-preview"
        src={source}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 560px"
        quality={75}
        onError={() => setFailed(true)}
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          if (naturalWidth && naturalHeight) setAspectRatio(naturalWidth / naturalHeight);
        }}
      />
      </button>
      {zoom && <MediaLightbox source={source} title={title} onClose={() => { setZoom(false); }} />}
    </div>
  );
  return null;
}
