"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicLab } from "@/lib/learning-labs";

type Props = {
  lab: PublicLab;
  meta: { taskCount: number; evidenceCount: number };
  unlocked: boolean;
  price: number;
  listPrice: number;
  tecBalance: number;
  solvedIds: string[];
  completed: boolean;
  debrief: string;
};

export function LabView({ lab, meta, unlocked, price, listPrice, tecBalance, solvedIds, completed, debrief }: Props) {
  const router = useRouter();
  const [solved, setSolved] = useState(new Set(solvedIds));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [hints, setHints] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(completed);
  const [finalDebrief, setFinalDebrief] = useState(debrief);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function unlock() {
    setBusy("unlock");
    setError("");
    const response = await fetch("/api/learning/labs/unlock", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: lab.slug }) });
    const data = await response.json().catch(() => ({}));
    setBusy("");
    if (!response.ok) return setError(data.error ?? "Laboratoriyani ochib bo‘lmadi.");
    router.refresh();
  }

  async function submit(taskId: string) {
    const answer = (answers[taskId] ?? "").trim();
    if (!answer) return;
    setBusy(taskId);
    const response = await fetch("/api/learning/labs/answer", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: lab.slug, taskId, answer }) });
    const data = await response.json().catch(() => ({}));
    setBusy("");
    if (!response.ok) return setFeedback((current) => ({ ...current, [taskId]: data.error ?? "Xatolik." }));
    if (data.correct) {
      setSolved((current) => new Set(current).add(taskId));
      setFeedback((current) => ({ ...current, [taskId]: "To‘g‘ri ✓" }));
      if (data.completed) {
        setDone(true);
        setFinalDebrief(data.debrief ?? "");
      }
    } else {
      setFeedback((current) => ({ ...current, [taskId]: "Noto‘g‘ri. Dalilni qayta tekshiring." }));
    }
  }

  return <div className="container page-shell practice-page lab-page">
    <Link href="/learning/practice" className="muted">← Amaliyot</Link>
    <header className="practice-head">
      <div>
        <span className="eyebrow">{lab.level} · ~{lab.minutes} daqiqa</span>
        <h1>{lab.title}</h1>
        <p className="muted">{lab.summary}</p>
      </div>
    </header>

    {!unlocked ? <section className="practice-lock">
      <h2>Laboratoriya yopiq</h2>
      <p>{meta.evidenceCount} ta dalil fayli va {meta.taskCount} ta topshiriq. Narx: <strong>{price === 0 ? "Bepul (Expert)" : `${price} TEC`}</strong>{price !== listPrice && price > 0 && <s> {listPrice}</s>}. Balansingiz: {tecBalance} TEC.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      {tecBalance < price ? <Link href="/store" className="button">TEC olish</Link> : <button type="button" className="button" disabled={busy === "unlock"} onClick={unlock}>{price === 0 ? "Ochish" : `${price} TEC evaziga ochish`}</button>}
    </section> : <>
      <section className="lab-scenario"><h2>Vaziyat</h2><p>{lab.scenario}</p></section>
      <section>
        <h2>Dalillar</h2>
        {lab.evidence.map((file) => <details key={file.name} className="lab-evidence" open={lab.evidence.length === 1}>
          <summary>{file.name}</summary>
          <pre tabIndex={0}>{file.content}</pre>
        </details>)}
      </section>
      <section>
        <h2>Topshiriqlar · {solved.size}/{lab.tasks.length}</h2>
        {lab.tasks.map((task, index) => {
          const isSolved = solved.has(task.id);
          return <form key={task.id} className={`lab-task${isSolved ? " is-solved" : ""}`} onSubmit={(event) => { event.preventDefault(); void submit(task.id); }}>
            <p><strong>{index + 1}.</strong> {task.prompt}</p>
            {isSolved ? <p className="lab-ok">Yechildi ✓</p> : <>
              <div className="lab-answer-row">
                <input value={answers[task.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [task.id]: event.target.value }))} placeholder="Javob" maxLength={200} aria-label={`${index + 1}-topshiriq javobi`} />
                <button className="button" type="submit" disabled={busy === task.id}>Tekshirish</button>
                <button className="button ghost" type="button" onClick={() => setHints((current) => new Set(current).add(task.id))}>Maslahat</button>
              </div>
              {hints.has(task.id) && <p className="muted">💡 {task.hint}</p>}
              {feedback[task.id] && <p className="muted" role="status">{feedback[task.id]}</p>}
            </>}
          </form>;
        })}
      </section>
      {done && <section className="lab-debrief">
        <h2>Laboratoriya yakunlandi 🎉</h2>
        <p>{finalDebrief}</p>
        <Link href="/learning/practice" className="button">Imtihonlarga o‘tish</Link>
      </section>}
    </>}
  </div>;
}
