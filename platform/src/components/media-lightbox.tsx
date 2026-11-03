"use client";

import { SiteDialog } from "./site-dialog";

export function MediaLightbox({ source, title, onClose }: { source: string; title: string; onClose: () => void }) {
  return <SiteDialog className="media-lightbox" title={title} onClose={onClose}>
    <img src={source} alt={title} />
  </SiteDialog>;
}
