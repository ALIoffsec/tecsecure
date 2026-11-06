"use client";

import { useEffect } from "react";
import { SiteDialog } from "./site-dialog";

export function MediaLightbox({ source, title, onClose, onPrev, onNext, counter, prevLabel, nextLabel }: {
  source: string;
  title: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  counter?: string;
  prevLabel?: string;
  nextLabel?: string;
}) {
  useEffect(() => {
    if (!onPrev && !onNext) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onPrev?.();
      if (event.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);
  return <SiteDialog className="media-lightbox" title={title} onClose={onClose}>
    <div className="media-lightbox-body">
      <img key={source} src={source} alt={title} />
      {onPrev && <button type="button" className="work-arrow media-lightbox-prev" aria-label={prevLabel} onClick={onPrev}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.75 19.5 8.25 12l7.5-7.5" /></svg></button>}
      {onNext && <button type="button" className="work-arrow media-lightbox-next" aria-label={nextLabel} onClick={onNext}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg></button>}
      {counter && <span className="media-lightbox-counter">{counter}</span>}
    </div>
  </SiteDialog>;
}
