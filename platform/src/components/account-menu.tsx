"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "./site-preferences";
import { UiIcon, type IconName } from "./ui-icon";
import { AccountSessionActions } from "./account-session-actions";
import { cabinetLabels } from "@/lib/cabinet-routes";
import { loginPath } from "@/lib/safe-next";

type Who = { name: string; maskedPhone: string | null };

const groups: { key: "account" | "purchases" | "study"; items: { href: string; label: "profile" | "settings" | "orders" | "requests" | "wallet" | "learning" | "certificates"; icon: IconName; tone: string }[] }[] = [
  { key: "account", items: [{ href: "/portal", label: "profile", icon: "user", tone: "blue" }, { href: "/portal/settings", label: "settings", icon: "settings", tone: "grey" }] },
  { key: "purchases", items: [{ href: "/portal/orders", label: "orders", icon: "truck", tone: "orange" }, { href: "/portal/requests", label: "requests", icon: "clipboard", tone: "teal" }, { href: "/portal/wallet", label: "wallet", icon: "wallet", tone: "green" }] },
  { key: "study", items: [{ href: "/learning", label: "learning", icon: "book", tone: "violet" }, { href: "/learning/certifications", label: "certificates", icon: "shield", tone: "gold" }] }
];

/**
 * The account menu behind the avatar (cabinet head) and the profile button (site header). A glass popover
 * beside the button on a computer, a bottom sheet with a grabber on a phone (swipe down or tap outside to
 * close). It is a modal dialog: Esc closes it, focus stays inside, and returns to the button afterwards.
 */
export function AccountMenu({ who, children, className, label }: { who?: Who; children: ReactNode; className: string; label: string }) {
  const { locale } = useSitePreferences();
  const labels = cabinetLabels[locale];
  const router = useRouter();
  const button = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [person, setPerson] = useState<Who | null>(who ?? null);
  const [place, setPlace] = useState<{ top: number; right: number } | null>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);

  async function show() {
    if (!person) {
      // The site header does not know who is signed in; a guest goes to sign in instead.
      const response = await fetch("/api/auth/me", { cache: "no-store" }).catch(() => null);
      if (!response?.ok) { router.push(loginPath("/portal")); return; }
      const data = await response.json().catch(() => null);
      setPerson({ name: data?.user?.name ?? "", maskedPhone: data?.maskedPhone ?? null });
    }
    const rect = button.current?.getBoundingClientRect();
    if (rect) setPlace({ top: Math.round(rect.bottom + 12), right: Math.max(12, Math.round(window.innerWidth - rect.right)) });
    setOpen(true);
  }

  useEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    element.showModal();
    const opener = button.current;
    return () => { element.close(); opener?.focus(); };
  }, [open]);

  function close() { setOpen(false); }

  return <>
    <button ref={button} type="button" className={className} aria-haspopup="dialog" aria-expanded={open} aria-label={label} onClick={() => void show()}>{children}</button>
    {open && <dialog ref={dialog} className="account-menu" aria-label={label} style={place ? { "--menu-top": `${place.top}px`, "--menu-right": `${place.right}px` } as React.CSSProperties : undefined}
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="account-menu-panel"
        onPointerDown={event => { if ((event.target as HTMLElement).closest(".account-menu-grabber")) drag.current = { startY: event.clientY, dy: 0 }; }}
        onPointerMove={event => {
          if (!drag.current) return;
          drag.current.dy = Math.max(0, event.clientY - drag.current.startY);
          event.currentTarget.style.transform = `translateY(${drag.current.dy}px)`;
        }}
        onPointerUp={event => {
          const moved = drag.current?.dy ?? 0;
          drag.current = null;
          event.currentTarget.style.transform = "";
          if (moved > 80) close();
        }}>
        <div className="account-menu-grabber" aria-hidden="true"><span /></div>
        {person && <div className="account-menu-who">
          <span className="cab-avatar" aria-hidden="true">{person.name.slice(0, 1).toUpperCase()}</span>
          <span><strong>{person.name}</strong>{person.maskedPhone && <small>{person.maskedPhone}</small>}</span>
        </div>}
        {groups.map(group => <section key={group.key} className="account-menu-group" aria-label={labels.groups[group.key]}>
          <h2>{labels.groups[group.key]}</h2>
          <ul>{group.items.map(item => <li key={item.href}>
            <Link href={item.href} onClick={close}>
              <span className={`account-menu-icon tone-${item.tone}`} aria-hidden="true"><UiIcon name={item.icon} size={16} /></span>
              <span className="account-menu-label">{labels[item.label]}</span>
              <span className="account-menu-chevron" aria-hidden="true"><UiIcon name="chevronRight" size={16} /></span>
            </Link>
          </li>)}</ul>
        </section>)}
        <div className="account-menu-group account-menu-out"><AccountSessionActions compact /></div>
      </div>
    </dialog>}
  </>;
}
