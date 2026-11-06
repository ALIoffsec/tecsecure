"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MediaGallery, MediaUploader } from "@/components/media-uploader";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import { growthCopy } from "@/lib/growth-copy";

type PortfolioPost = { id: string; title: string; description: string; media: unknown; published: boolean; slug: string; location?: string | null; task?: string | null; work?: string | null; result?: string | null; clientName?: string | null; clientRole?: string | null; clientQuote?: string | null };

export function PortfolioManager({ posts }: { posts: PortfolioPost[] }) {
  const { t, locale } = useSitePreferences();
  const story = growthCopy[locale].workAdmin;
  const storyTitle = growthCopy[locale].work.story;
  const router = useRouter();
  const [editing, setEditing] = useState<PortfolioPost | null>(null);
  const [media, setMedia] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const editorRef = useRef<HTMLDetailsElement>(null);

  function beginEdit(post: PortfolioPost) {
    setEditing(post);
    setMedia(Array.isArray(post.media) ? post.media.filter((item): item is string => typeof item === "string") : []);
    if (editorRef.current) editorRef.current.open = true;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch(editing ? `/api/admin/portfolio/${editing.id}` : "/api/admin/portfolio", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.get("title"),
          description: data.get("description"),
          published: data.get("published") === "on",
          location: data.get("location"), task: data.get("task"), work: data.get("work"), result: data.get("result"),
          clientName: data.get("clientName"), clientRole: data.get("clientRole"), clientQuote: data.get("clientQuote"),
          media
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setEditing(null); setMedia([]); form.reset(); if (editorRef.current) editorRef.current.open = false; router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function remove(post: PortfolioPost) {
    if (!window.confirm(t("deletePortfolioConfirm"))) return;
    const response = await fetch(`/api/admin/portfolio/${post.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? t("requestFailed")); return; }
    router.refresh();
  }

  return <section className="panel-card">
    <h2>{t("portfolioManagement")}</h2>
    <p className="small muted">{t("portfolioManagementDescription")}</p>
    <ToastMessage message={error} variant="error" />
    <details className="admin-editor-accordion" ref={editorRef}>
      <summary>{editing ? `${t("edit")} · ${editing.title}` : t("addPortfolioPost")}</summary>
      <form className="form" key={editing?.id ?? "new-portfolio"} onSubmit={save}>
        <div className="field"><label>{t("portfolioTitle")}</label><input name="title" defaultValue={editing?.title ?? ""} minLength={2} maxLength={180} required /></div>
        <div className="field"><label>{t("description")}</label><textarea name="description" defaultValue={editing?.description ?? ""} minLength={5} maxLength={10000} required /></div>
        <MediaUploader scope="PORTFOLIO" value={media} onChange={setMedia} />
        <h3>{storyTitle}</h3>
        <div className="field"><label>{story.location}</label><input name="location" defaultValue={editing?.location ?? ""} maxLength={120} /></div>
        <div className="field"><label>{story.task}</label><textarea name="task" defaultValue={editing?.task ?? ""} maxLength={4000} rows={3} /></div>
        <div className="field"><label>{story.done}</label><textarea name="work" defaultValue={editing?.work ?? ""} maxLength={4000} rows={3} /></div>
        <div className="field"><label>{story.result}</label><textarea name="result" defaultValue={editing?.result ?? ""} maxLength={4000} rows={3} /></div>
        <div className="form-row">
          <div className="field"><label>{story.clientName}</label><input name="clientName" defaultValue={editing?.clientName ?? ""} maxLength={120} /></div>
          <div className="field"><label>{story.clientRole}</label><input name="clientRole" defaultValue={editing?.clientRole ?? ""} maxLength={120} /></div>
        </div>
        <div className="field"><label>{story.clientQuote}</label><textarea name="clientQuote" defaultValue={editing?.clientQuote ?? ""} maxLength={1000} rows={2} /></div>
        <label className="permission-option"><input type="checkbox" name="published" defaultChecked={editing?.published ?? false} />{t("publishPortfolioPost")}</label>
        <div className="hero-actions"><button className="button" disabled={busy}>{editing ? t("save") : t("addPortfolioPost")}</button>{editing && <button className="button ghost" type="button" onClick={() => { setEditing(null); setMedia([]); if (editorRef.current) editorRef.current.open = false; }}>{t("cancel")}</button>}</div>
      </form>
    </details>
    <details className="admin-records-accordion">
      <summary>{t("portfolioManagement")} · {posts.length}</summary>
      <div className="admin-managed-record-list">{posts.map((post) => <details className="admin-managed-record" key={post.id}>
        <summary><span>{post.title}</span><small>{post.published ? t("published") : t("draft")}</small></summary>
        <div className="admin-managed-record-content">
          <p>{post.description}</p>
          <MediaGallery media={post.media} title={post.title} />
          <div className="hero-actions"><button className="button secondary small" type="button" onClick={() => beginEdit(post)}>{t("edit")}</button><button className="button danger small" type="button" onClick={() => void remove(post)}>{t("delete")}</button></div>
        </div>
      </details>)}</div>
    </details>
  </section>;
}
