"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

async function send(url: string, method: string, body: unknown) {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (response.ok) return "";
  return (await response.json().catch(() => ({}))).error ?? "Xatolik yuz berdi.";
}

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (rating === 0) { setError("Bahoni tanlang."); return; }
    setBusy(true);
    const message = await send(`/api/products/${productId}/reviews`, "POST", { rating, pros, cons, comment });
    setBusy(false);
    if (message) setError(message); else router.refresh();
  }
  return <form className="shop-review-form" onSubmit={submit}>
    <strong>Sharh qoldirish</strong>
    <div className="shop-stars-input" role="radiogroup" aria-label="Baho">
      {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} yulduz`} className={n <= rating ? "on" : ""} onClick={() => setRating(n)}>★</button>)}
    </div>
    <input placeholder="Afzalliklari" value={pros} maxLength={500} onChange={(e) => setPros(e.target.value)} />
    <input placeholder="Kamchiliklari" value={cons} maxLength={500} onChange={(e) => setCons(e.target.value)} />
    <textarea placeholder="Fikringiz (kamida 10 belgi)" required minLength={10} maxLength={2000} rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
    {error && <p role="alert" className="small" style={{ color: "#e5604f" }}>{error}</p>}
    <button className="button" disabled={busy}>{busy ? "Yuborilmoqda…" : "Yuborish"}</button>
  </form>;
}

export function QuestionForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const message = await send(`/api/products/${productId}/questions`, "POST", { question });
    setBusy(false);
    if (message) setError(message); else { setQuestion(""); setError(""); router.refresh(); }
  }
  return <form className="shop-review-form" onSubmit={submit}>
    <strong>Savol berish</strong>
    <textarea placeholder="Mahsulot haqida savolingiz" required minLength={5} maxLength={500} rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} />
    {error && <p role="alert" className="small" style={{ color: "#e5604f" }}>{error}</p>}
    <button className="button" disabled={busy}>{busy ? "Yuborilmoqda…" : "Savol yuborish"}</button>
  </form>;
}

export function AnswerForm({ productId, questionId }: { productId: string; questionId: string }) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const message = await send(`/api/products/${productId}/questions`, "PATCH", { questionId, answer });
    if (message) setError(message); else router.refresh();
  }
  return <form onSubmit={submit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    <input style={{ flex: 1, minWidth: 180 }} placeholder="Javob (xodim)" required value={answer} onChange={(e) => setAnswer(e.target.value)} />
    <button className="button secondary">Javob berish</button>
    {error && <span role="alert" className="small" style={{ color: "#e5604f" }}>{error}</span>}
  </form>;
}
