"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";

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

export function MediaGallery({ media, title, marquee = false }: { media: unknown; title: string; marquee?: boolean }) {
  if (!Array.isArray(media)) return null;
  const ids = media.filter((value): value is string => typeof value === "string");
  if (!ids.length) return null;
  return (
    <div className={`media-gallery${marquee ? " media-gallery-marquee" : ""}`}>
      {marquee ? (
        <div className="media-marquee-track" role="list">
          {[...ids, ...ids].map((id, index) => (
            <MediaPreview key={`${id}-${index}`} id={id} title={title} marquee decorative={index >= ids.length} />
          ))}
        </div>
      ) : ids.map((id) => <MediaPreview key={id} id={id} title={title} />)}
    </div>
  );
}

function MediaPreview({ id, title, marquee = false, decorative = false }: { id: string; title: string; marquee?: boolean; decorative?: boolean }) {
  const [mime, setMime] = useState("");
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const source = `/api/media/${id}`;
  useEffect(() => {
    let active = true;
    fetch(source, { method: "HEAD" })
      .then((response) => {
        if (response.ok && active) setMime(response.headers.get("content-type") ?? "");
      })
      .catch(() => {
        if (active) setMime("image/unknown");
      });
    return () => { active = false; };
  }, [source]);
  if (!mime) return null;
  const itemClassName = marquee ? "media-marquee-item" : undefined;
  const itemStyle = marquee ? { aspectRatio: String(aspectRatio) } : undefined;
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
      <Image
        className={marquee ? "media-preview media-marquee-preview" : "media-preview"}
        src={source}
        alt={decorative ? "" : title}
        fill
        sizes={marquee ? "(max-width: 640px) 75vw, (max-width: 1200px) 42vw, 480px" : "(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 560px"}
        quality={75}
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          if (naturalWidth && naturalHeight) setAspectRatio(naturalWidth / naturalHeight);
        }}
      />
    </div>
  );
  return null;
}
