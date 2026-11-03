"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useSitePreferences } from "./site-preferences";
import { journeyCopy } from "@/lib/journey-copy";

export function SiteDialog({ title, className, onClose, children }: {
  title: string; className: string; onClose: () => void; children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
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
  return <dialog ref={dialog} className={className} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
    }} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
    <header className="site-dialog-heading"><strong id={titleId}>{title}</strong><button className="button secondary" type="button" onClick={onClose}>{journeyCopy[locale].close}</button></header>
    {children}
  </dialog>;
}
