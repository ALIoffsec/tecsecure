"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductVisual } from "./product-visual";
import { MediaLightbox } from "./media-lightbox";
import { useSitePreferences } from "./site-preferences";
import { journeyCopy } from "@/lib/journey-copy";
import { coverMedia, type CatalogMedia } from "@/lib/catalog-utils";

type Props = { assets: CatalogMedia[]; title: string; slug?: string; categorySlug?: string | null };

export function ProductMedia({ assets, title, slug, categorySlug }: Props) {
  const asset = coverMedia(assets);
  const { locale } = useSitePreferences();
  const c = journeyCopy[locale];
  const [failed, setFailed] = useState(false);
  const [alternateFailed, setAlternateFailed] = useState(false);
  const alternate = assets.find(item => item.id !== asset?.id && item.mimeType.startsWith("image/"));
  if (!asset) return <div className="product-media-fallback"><ProductVisual categorySlug={categorySlug} productSlug={slug} name={title} /><span>{c.photoMissing}</span></div>;
  if (failed) return <div className="product-media-error" role="status">{c.mediaError}</div>;
  return <div className="product-media-card">
    {asset.mimeType.startsWith("image/")
      ? <><Image src={`/api/media/${asset.id}`} alt={title} fill sizes="(max-width: 640px) 46vw, (max-width: 1100px) 33vw, 300px" onError={() => setFailed(true)} />
        {alternate && !alternateFailed && <Image className="product-media-alternate" src={`/api/media/${alternate.id}`} alt="" aria-hidden="true" fill sizes="(max-width: 640px) 46vw, (max-width: 1100px) 33vw, 300px" onError={() => setAlternateFailed(true)} />}
        {alternateFailed && <span className="product-media-notice" role="status">{c.mediaError}</span>}
      </>
      : <><span>{c.video}</span><video src={`/api/media/${asset.id}`} muted preload="metadata" playsInline aria-label={title} onError={() => setFailed(true)} /></>}
  </div>;
}

export function ProductGallery({ assets, title, slug, categorySlug }: Props) {
  const { locale } = useSitePreferences();
  const c = journeyCopy[locale];
  const [index, setIndex] = useState(() => Math.max(0, assets.findIndex(asset => asset.mimeType.startsWith("image/"))));
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(false);
  const asset = assets[index];
  if (!asset) return <ProductMedia assets={assets} title={title} slug={slug} categorySlug={categorySlug} />;
  const source = `/api/media/${asset.id}`;
  return <div className="product-gallery">
    <div className="product-gallery-stage">
      {failed ? <div className="product-media-error" role="status"><p>{c.mediaError}</p><button className="button secondary" type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>{c.retry}</button></div>
        : asset.mimeType.startsWith("image/") ? <button type="button" aria-label={c.zoom} onClick={() => setZoom(true)}>
          <Image key={`${asset.id}-${attempt}`} src={source} alt={title} fill sizes="(max-width: 900px) 92vw, 560px" onError={() => setFailed(true)} />
        </button> : <video key={`${asset.id}-${attempt}`} src={source} controls preload="metadata" aria-label={title} onError={() => setFailed(true)} />}
    </div>
    <div className="product-thumbnails" role="group" aria-label={title}>
      {assets.map((item, position) => <button key={item.id} type="button" aria-pressed={position === index} aria-label={`${item.mimeType.startsWith("image/") ? c.image : c.video} ${position + 1}`} onClick={() => { setIndex(position); setFailed(false); }}>
        {item.mimeType.startsWith("image/") ? <Image src={`/api/media/${item.id}`} alt="" fill sizes="64px" /> : <span>{c.video}</span>}
      </button>)}
    </div>
    {zoom && <MediaLightbox source={source} title={title} onClose={() => setZoom(false)} />}
  </div>;
}
