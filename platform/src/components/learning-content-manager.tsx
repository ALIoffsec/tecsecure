"use client";

import { useEffect, useMemo, useState } from "react";

type LearningKind = "module" | "path" | "lab" | "exam";
type LearningStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type LearningDocument = {
  id: string | null;
  kind: LearningKind;
  slug: string;
  title: string;
  summary: string;
  status: LearningStatus;
  count: number;
};
type FullDocument = {
  id: string | null;
  kind: LearningKind;
  slug: string;
  status: LearningStatus;
  data: Record<string, unknown>;
  isNew: boolean;
};

const kindLabels: Record<LearningKind, string> = {
  module: "Kurs moduli",
  path: "O‘quv yo‘nalishi",
  lab: "Laboratoriya",
  exam: "Imtihon"
};

function emptyDocument(kind: LearningKind): Record<string, unknown> {
  const localized = { uz: "", ru: "", en: "" };
  if (kind === "module") return {
    slug: "", title: localized, summary: localized, difficulty: "fundamental", category: "networking",
    hours: 1, hasLab: false, sections: [{ title: localized, content: localized }]
  };
  if (kind === "path") return {
    slug: "", kind: "skill", title: localized, summary: localized, timeEstimate: localized,
    prerequisites: localized, outcomes: localized, capstone: localized, modules: []
  };
  if (kind === "lab") return {
    slug: "", moduleSlug: "", title: "", level: "boshlang‘ich", minutes: 20, priceTec: 0,
    summary: "", scenario: "", skills: [], evidence: [], tasks: [{ id: "task-1", prompt: "", answers: [""], hint: "" }], debrief: ""
  };
  return {
    slug: "", title: "", credential: "", acronym: "", accent: "blue", summary: "", feeTec: 0,
    minutes: 30, passPercent: 70, requiredModules: [], requiredLabs: [], topics: [],
    questions: [{ id: "q1", text: "", options: ["", "", "", ""], correct: 0, explanation: "" }]
  };
}

export function LearningContentManager() {
  const [documents, setDocuments] = useState<LearningDocument[]>([]);
  const [kindFilter, setKindFilter] = useState<LearningKind | "all">("all");
  const [selected, setSelected] = useState<FullDocument | null>(null);
  const [json, setJson] = useState("");
  const [status, setStatus] = useState<LearningStatus>("DRAFT");
  const [newKind, setNewKind] = useState<LearningKind>("module");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const visibleDocuments = useMemo(
    () => documents.filter((document) => kindFilter === "all" || document.kind === kindFilter),
    [documents, kindFilter]
  );

  async function loadDocuments() {
    const response = await fetch(`/api/admin/learning${kindFilter === "all" ? "" : `?kind=${kindFilter}`}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Ta’lim materiallarini yuklab bo‘lmadi.");
    setDocuments(result.documents);
  }

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/learning${kindFilter === "all" ? "" : `?kind=${kindFilter}`}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Ta’lim materiallarini yuklab bo‘lmadi.");
        if (active) setDocuments(result.documents);
      })
      .catch((issue: unknown) => {
        if (active) setError(issue instanceof Error ? issue.message : "Ta’lim materiallarini yuklab bo‘lmadi.");
      });
    return () => { active = false; };
  }, [kindFilter]);

  async function openDocument(document: LearningDocument) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/learning/${document.kind}/${encodeURIComponent(document.slug)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Ta’lim materialini yuklab bo‘lmadi.");
      const full = result.document as FullDocument;
      setSelected({ ...full, isNew: false });
      setStatus(full.status);
      setJson(JSON.stringify(full.data, null, 2));
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Ta’lim materialini yuklab bo‘lmadi.");
    } finally {
      setBusy(false);
    }
  }

  function startNew() {
    setError(""); setNotice("");
    const data = emptyDocument(newKind);
    setSelected({ id: null, kind: newKind, slug: "", status: "DRAFT", data, isNew: true });
    setStatus("DRAFT");
    setJson(JSON.stringify(data, null, 2));
  }

  async function saveDocument() {
    if (!selected) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const data: unknown = JSON.parse(json);
      const path = selected.isNew
        ? "/api/admin/learning"
        : `/api/admin/learning/${selected.kind}/${encodeURIComponent(selected.slug)}`;
      const response = await fetch(path, {
        method: selected.isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected.isNew ? { kind: selected.kind, status, data } : { status, data })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Ta’lim materialini saqlab bo‘lmadi.");
      setNotice("Ta’lim materiali saqlandi.");
      await loadDocuments();
      const slug = typeof data === "object" && data !== null && "slug" in data && typeof data.slug === "string" ? data.slug : "";
      const saved = documents.find((item) => item.kind === selected.kind && item.slug === slug);
      if (saved) await openDocument(saved);
      else if (slug) {
        const detailResponse = await fetch(`/api/admin/learning/${selected.kind}/${encodeURIComponent(slug)}`, { cache: "no-store" });
        const detail = await detailResponse.json();
        if (!detailResponse.ok) throw new Error(detail.error ?? "Saqlangan materialni qayta yuklab bo‘lmadi.");
        setSelected({ ...detail.document, isNew: false });
        setStatus(detail.document.status);
        setJson(JSON.stringify(detail.document.data, null, 2));
      }
    } catch (issue) {
      setError(issue instanceof SyntaxError ? "Kontent JSON formatida bo‘lishi kerak." : issue instanceof Error ? issue.message : "Ta’lim materialini saqlab bo‘lmadi.");
    } finally {
      setBusy(false);
    }
  }

  async function archiveDocument(document: LearningDocument) {
    if (!window.confirm(`${kindLabels[document.kind]} "${document.title}" arxivlansinmi?`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/learning/${document.kind}/${encodeURIComponent(document.slug)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Ta’lim materialini arxivlab bo‘lmadi.");
      setNotice("Ta’lim materiali arxivlandi.");
      if (selected?.kind === document.kind && selected.slug === document.slug) setSelected(null);
      await loadDocuments();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Ta’lim materialini arxivlab bo‘lmadi.");
    } finally {
      setBusy(false);
    }
  }

  let preview = "JSON kontentini tekshiring.";
  try {
    preview = JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    preview = "JSON noto‘g‘ri yoki hali to‘liq kiritilmagan.";
  }

  return <section className="panel-card learning-content-manager">
    <div className="section-head">
      <div><h2>Ta’lim kontenti</h2><p className="muted">Kurs, yo‘nalish, laboratoriya va imtihonlarni boshqaring. Nashr qilingan kontent saytda ko‘rinadi.</p></div>
    </div>
    {error && <p className="notice error" role="alert">{error}</p>}
    {notice && <p className="notice success" role="status">{notice}</p>}
    <div className="learning-cms-toolbar">
      <select aria-label="Kontent turi bo‘yicha filter" value={kindFilter} onChange={(event) => setKindFilter(event.target.value as LearningKind | "all")}>
        <option value="all">Barcha turlar</option>
        {Object.entries(kindLabels).map(([kind, label]) => <option key={kind} value={kind}>{label}</option>)}
      </select>
      <select aria-label="Yangi kontent turi" value={newKind} onChange={(event) => setNewKind(event.target.value as LearningKind)}>
        {Object.entries(kindLabels).map(([kind, label]) => <option key={kind} value={kind}>{label}</option>)}
      </select>
      <button type="button" className="button" disabled={busy} onClick={startNew}>Yangi material</button>
    </div>
    <div className="learning-cms-layout">
      <div className="learning-cms-list" aria-label="Ta’lim materiallari">
        {visibleDocuments.map((document) => <article className={`learning-cms-item${selected?.kind === document.kind && selected.slug === document.slug ? " active" : ""}`} key={`${document.kind}-${document.slug}`}>
          <button type="button" className="learning-cms-item-open" disabled={busy} onClick={() => void openDocument(document)}>
            <strong>{document.title || document.slug}</strong>
            <span>{kindLabels[document.kind]} · {document.status}</span>
            <small>{document.summary}</small>
            <small>{document.count} bo‘lim/qism · {document.slug}</small>
          </button>
          {document.status !== "ARCHIVED" && <button type="button" className="button danger small" disabled={busy} onClick={() => void archiveDocument(document)}>Arxivlash</button>}
        </article>)}
        {!visibleDocuments.length && <p className="muted">Bu turda material topilmadi.</p>}
      </div>
      <div className="learning-cms-editor">
        {selected ? <>
          <div className="learning-cms-editor-head">
            <div><strong>{selected.id ? "Materialni tahrirlash" : `Yangi: ${kindLabels[selected.kind]}`}</strong><small>{selected.slug || "slug JSON kontentidan olinadi"}</small></div>
            <select aria-label="Nashr holati" value={status} onChange={(event) => setStatus(event.target.value as LearningStatus)}>
              <option value="DRAFT">Qoralama</option><option value="PUBLISHED">Nashrda</option><option value="ARCHIVED">Arxivlangan</option>
            </select>
          </div>
          <label className="field">To‘liq kontent (JSON)
            <textarea className="learning-cms-json" spellCheck={false} value={json} onChange={(event) => setJson(event.target.value)} />
          </label>
          <div className="learning-cms-preview"><strong>JSON preview</strong><pre>{preview}</pre></div>
          <div className="hero-actions">
            <button type="button" className="button" disabled={busy} onClick={() => void saveDocument()}>{busy ? "Saqlanmoqda…" : "Saqlash"}</button>
            <button type="button" className="button ghost" disabled={busy} onClick={() => setSelected(null)}>Yopish</button>
          </div>
        </> : <p className="muted">Ro‘yxatdan material tanlang yoki yangisini yarating.</p>}
      </div>
    </div>
  </section>;
}
