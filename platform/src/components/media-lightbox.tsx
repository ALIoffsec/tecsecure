"use client";

import { useEffect, useRef } from "react";
import { useSitePreferences } from "./site-preferences";
import { journeyCopy } from "@/lib/journey-copy";

export function MediaLightbox({ source, title, onClose }: { source: string; title: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { locale } = useSitePreferences();
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  return <dialog ref={dialog} className="media-lightbox" aria-label={title} onCancel={onClose} onKeyDown={event => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
  }} onClick={event => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <header><strong>{title}</strong><button className="button secondary" type="button" onClick={onClose}>{journeyCopy[locale].close}</button></header>
    <img src={source} alt={title} />
  </dialog>;
}
