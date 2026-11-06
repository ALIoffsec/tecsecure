"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastMessage } from "@/components/toast-provider";
import { useSitePreferences } from "@/components/site-preferences";
import { shopCopy } from "@/lib/shop-copy";

async function send(url: string, method: string, body: unknown) {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (response.ok) return "";
  return (await response.json().catch(() => ({}))).error ?? "error";
}

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const c = shopCopy[useSitePreferences().locale];
  const [rating, setRating] = useState(0);
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (rating === 0) { setError(c.ratingRequired); return; }
    setBusy(true);
    const message = await send(`/api/products/${productId}/reviews`, "POST", { rating, pros, cons, comment });
    setBusy(false);
    if (message) setError(message === "error" ? c.genericError : message); else router.refresh();
  }
  return <form className="shop-review-form" onSubmit={submit}>
    <strong>{c.leaveReview}</strong>
    <div className="shop-stars-input" role="radiogroup" aria-label={c.rating}>
      {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} / 5`} className={n <= rating ? "on" : ""} onClick={() => setRating(n)}>★</button>)}
    </div>
    <input placeholder={c.pros} value={pros} maxLength={500} onChange={(e) => setPros(e.target.value)} />
    <input placeholder={c.cons} value={cons} maxLength={500} onChange={(e) => setCons(e.target.value)} />
    <textarea placeholder={c.yourComment} required minLength={10} maxLength={2000} rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
    <ToastMessage message={error} variant="error" />
    <button className="button" disabled={busy}>{busy ? c.sending : c.send}</button>
  </form>;
}

export function QuestionForm({ productId }: { productId: string }) {
  const router = useRouter();
  const c = shopCopy[useSitePreferences().locale];
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const message = await send(`/api/products/${productId}/questions`, "POST", { question });
    setBusy(false);
    if (message) setError(message === "error" ? c.genericError : message); else { setQuestion(""); setError(""); router.refresh(); }
  }
  return <form className="shop-review-form" onSubmit={submit}>
    <strong>{c.askQuestion}</strong>
    <textarea placeholder={c.yourQuestion} required minLength={5} maxLength={500} rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} />
    <ToastMessage message={error} variant="error" />
    <button className="button" disabled={busy}>{busy ? c.sending : c.askQuestion}</button>
  </form>;
}

export function AnswerForm({ productId, questionId }: { productId: string; questionId: string }) {
  const router = useRouter();
  const c = shopCopy[useSitePreferences().locale];
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const message = await send(`/api/products/${productId}/questions`, "PATCH", { questionId, answer });
    if (message) setError(message === "error" ? c.genericError : message); else router.refresh();
  }
  return <form className="shop-answer-form" onSubmit={submit}>
    <input placeholder={c.answerPlaceholder} required minLength={2} maxLength={2000} value={answer} onChange={(e) => setAnswer(e.target.value)} />
    <button className="button secondary small">{c.answerAction}</button>
    <ToastMessage message={error} variant="error" />
  </form>;
}
