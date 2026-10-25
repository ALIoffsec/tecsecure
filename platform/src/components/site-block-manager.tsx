"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MediaGallery, MediaUploader } from "@/components/media-uploader";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import type { CSSProperties } from "react";
import type { MessageKey } from "@/lib/messages";

export type SiteBlockRecord = {
  id: string;
  page: string;
  title: string;
  body: string;
  media: unknown;
  enabled: boolean;
  sortOrder: number;
  columns: number;
  animation: string;
  animationDurationMs: number;
};

const pageOptions = ["all", "home", "about", "services", "products", "learning", "news", "work"] as const;
type BlockPage = typeof pageOptions[number];
const pageLabels: Record<BlockPage, MessageKey> = {
  all: "pageAll", home: "pageHome", about: "pageAbout", services: "pageServices",
  products: "pageProducts", learning: "pageLearning", news: "pageNews", work: "pageWork"
};

export function SiteBlockManager({ blocks }: { blocks: SiteBlockRecord[] }) {
  const { t } = useSitePreferences();
  const router = useRouter();
  const [editing, setEditing] = useState<SiteBlockRecord | null>(null);
  const [media, setMedia] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const editorRef = useRef<HTMLDetailsElement>(null);

  function edit(block: SiteBlockRecord) {
    setEditing(block);
    setMedia(Array.isArray(block.media) ? block.media.filter((item): item is string => typeof item === "string") : []);
    if (editorRef.current) editorRef.current.open = true;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const body = {
        page: values.get("page"),
        title: values.get("title"),
        body: values.get("body"),
        media,
        enabled: values.get("enabled") === "on",
        sortOrder: Number(values.get("sortOrder")),
        columns: Number(values.get("columns")),
        animation: values.get("animation"),
        animationDurationMs: Number(values.get("animationDurationMs"))
      };
      const response = await fetch(editing ? `/api/admin/site-blocks/${editing.id}` : "/api/admin/site-blocks", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setEditing(null);
      setMedia([]);
      form.reset();
      if (editorRef.current) editorRef.current.open = false;
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function remove(block: SiteBlockRecord) {
    if (!window.confirm(t("deleteSiteBlockConfirm"))) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/site-blocks/${block.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      if (editing?.id === block.id) {
        setEditing(null);
        setMedia([]);
        if (editorRef.current) editorRef.current.open = false;
      }
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }

  return <section className="panel-card">
    <h2>{t("siteBlocks")}</h2>
    <p className="small muted">{t("siteBlocksDescription")}</p>
    <ToastMessage message={error} variant="error" />
    <details className="admin-editor-accordion" ref={editorRef}>
      <summary>{editing ? `${t("edit")} · ${editing.title}` : t("addSiteBlock")}</summary>
      <form className="form" key={editing?.id ?? "new-site-block"} onSubmit={save}>
      <div className="form-row">
        <div className="field"><label htmlFor="block-title">{t("blockTitle")}</label><input id="block-title" name="title" defaultValue={editing?.title ?? ""} minLength={2} maxLength={180} required /></div>
        <div className="field"><label htmlFor="block-page">{t("blockPage")}</label><select id="block-page" name="page" defaultValue={editing?.page ?? "home"}>{pageOptions.map((page) => <option value={page} key={page}>{t(pageLabels[page])}</option>)}</select></div>
      </div>
      <div className="field"><label htmlFor="block-body">{t("blockDescription")}</label><textarea id="block-body" name="body" defaultValue={editing?.body ?? ""} maxLength={10000} rows={5} /></div>
      <MediaUploader scope="CONTENT" value={media} onChange={setMedia} />
      <div className="form-row">
        <div className="field"><label htmlFor="block-columns">{t("blockColumns")}</label><select id="block-columns" name="columns" defaultValue={editing?.columns ?? 3}>{[1, 2, 3, 4].map((count) => <option value={count} key={count}>{count}</option>)}</select></div>
        <div className="field"><label htmlFor="block-order">{t("blockOrder")}</label><input id="block-order" name="sortOrder" type="number" min="0" max="10000" defaultValue={editing?.sortOrder ?? blocks.length} /></div>
      </div>
      <div className="form-row">
        <div className="field"><label htmlFor="block-animation">{t("blockAnimation")}</label><select id="block-animation" name="animation" defaultValue={editing?.animation ?? "none"}><option value="none">{t("animationNone")}</option><option value="fade">{t("animationFade")}</option><option value="slide">{t("animationSlide")}</option><option value="zoom">{t("animationZoom")}</option></select></div>
        <div className="field"><label htmlFor="block-speed">{t("animationDuration")}</label><input id="block-speed" name="animationDurationMs" type="number" min="100" max="10000" step="100" defaultValue={editing?.animationDurationMs ?? 600} /></div>
      </div>
      <label className="permission-option"><input type="checkbox" name="enabled" defaultChecked={editing?.enabled ?? true} />{t("blockEnabled")}</label>
        <div className="hero-actions"><button className="button" disabled={busy}>{editing ? t("save") : t("addSiteBlock")}</button>{editing && <button className="button ghost" type="button" disabled={busy} onClick={() => { setEditing(null); setMedia([]); if (editorRef.current) editorRef.current.open = false; }}>{t("cancel")}</button>}</div>
      </form>
    </details>
    <details className="admin-records-accordion">
      <summary>{t("siteBlocks")} · {blocks.length}</summary>
      <div className="admin-managed-record-list">
        {blocks.map((block) => <details className="admin-managed-record" key={block.id}>
          <summary><span>{block.title}</span><small>{block.page} · {block.enabled ? t("active") : t("archived")}</small></summary>
          <div className="admin-managed-record-content">
            <p>{block.body || t("siteBlocksDescription")}</p>
            <p className="small muted">{block.columns} {t("blockColumns").toLowerCase()} · {t("blockAnimation")}: {block.animation}</p>
            <MediaGallery media={block.media} title={block.title} />
            <div className="hero-actions"><button className="button secondary small" type="button" disabled={busy} onClick={() => edit(block)}>{t("edit")}</button><button className="button danger small" type="button" disabled={busy} onClick={() => void remove(block)}>{t("delete")}</button></div>
          </div>
        </details>)}
      </div>
    </details>
  </section>;
}

export function SiteBlocksRenderer({ blocks }: { blocks: SiteBlockRecord[] }) {
  const pathname = usePathname();
  if (/^\/(admin|portal|staff)(\/|$)/.test(pathname)) return null;
  const page = pathname === "/" ? "home" : pathname.split("/")[1];
  const visible = blocks.filter((block) => block.enabled && (block.page === "all" || block.page === page))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (!visible.length) return null;
  return <section className="section site-cms-section">
    <div className="container">
      <div className="site-cms-grid" style={{ "--site-cms-columns": visible[0].columns } as CSSProperties}>
        {visible.map((block) => <article className={`panel-card site-cms-card site-cms-animation-${block.animation}`} key={block.id} style={{ "--site-cms-duration": `${block.animationDurationMs}ms` } as CSSProperties}>
          <h2>{block.title}</h2>
          {block.body && <p className="site-cms-body">{block.body}</p>}
          <MediaGallery media={block.media} title={block.title} />
        </article>)}
      </div>
    </div>
  </section>;
}
