"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ToastMessage } from "@/components/toast-provider";
import { useRouter } from "next/navigation";

type Req = { slug: string; title: string; done: boolean };
type Question = { id: string; text: string; options: string[] };
type Result = { expired: boolean; scorePercent: number; correctCount: number; total: number; passed: boolean; passPercent: number; certificateCode: string | null; review: { id: string; text: string; correctOption: string; explanation: string }[] };
type Props = {
  exam: { slug: string; title: string; summary: string; minutes: number; passPercent: number; questionCount: number; topics: string[] };
  price: number;
  listPrice: number;
  tecBalance: number;
  modules: Req[];
  labs: Req[];
  hasOpenAttempt: boolean;
  certificateCode: string | null;
};

export function ExamView({ exam, price, listPrice, tecBalance, modules, labs, hasOpenAttempt, certificateCode }: Props) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<{ id: string; deadline: number; questions: Question[] } | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitted = useRef(false);
  const ready = modules.every((item) => item.done) && labs.every((item) => item.done);

  async function start() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/learning/exams/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: exam.slug }) });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return setError(data.error ?? "Imtihonni boshlab bo‘lmadi.");
    submitted.current = false;
    setAttempt({ id: data.attemptId, deadline: new Date(data.deadlineAt).getTime(), questions: data.questions });
  }

  async function submit(auto = false) {
    if (!attempt || submitted.current) return;
    submitted.current = true;
    setBusy(true);
    const response = await fetch("/api/learning/exams/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ attemptId: attempt.id, answers }) });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      submitted.current = false;
      return setError(data.error ?? (auto ? "Vaqt tugadi." : "Topshirib bo‘lmadi."));
    }
    setResult(data);
    setAttempt(null);
    router.refresh();
  }

  useEffect(() => {
    if (!attempt) return;
    const tick = () => {
      const left = Math.max(0, Math.round((attempt.deadline - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) void submit(true);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  if (result) return <div className="container page-shell practice-page">
    <section className={`exam-result ${result.passed ? "is-pass" : "is-fail"}`}>
      <span className="eyebrow">{exam.title}</span>
      <h1>{result.passed ? "Imtihondan o‘tdingiz 🎉" : "Bu safar o‘tmadingiz"}</h1>
      <p className="exam-score">{result.scorePercent}%</p>
      <p className="muted">{result.correctCount}/{result.total} to‘g‘ri · o‘tish balli {result.passPercent}%{result.expired ? " · vaqt tugagan" : ""}</p>
      {result.certificateCode && <p><Link className="button" href={`/verify/${result.certificateCode}`}>Sertifikatni ochish</Link></p>}
      {result.review.length > 0 && <div className="exam-review"><h2>Xatolar tahlili</h2>
        {result.review.map((item) => <article key={item.id}><p><strong>{item.text}</strong></p><p className="lab-ok">To‘g‘ri javob: {item.correctOption}</p><p className="muted">{item.explanation}</p></article>)}
      </div>}
      <Link href="/learning/practice" className="button secondary">Amaliyot bo‘limiga qaytish</Link>
    </section>
  </div>;

  if (attempt) {
    const answered = Object.keys(answers).length;
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    return <div className="container page-shell practice-page">
      <div className="exam-bar"><strong>{exam.title}</strong><span>{answered}/{attempt.questions.length}</span><span className={secondsLeft < 120 ? "exam-time low" : "exam-time"}>{mm}:{ss}</span></div>
      {attempt.questions.map((question, index) => <fieldset key={question.id} className="exam-question">
        <legend>{index + 1}. {question.text}</legend>
        {question.options.map((option, optionIndex) => <label key={optionIndex} className={answers[question.id] === optionIndex ? "is-picked" : ""}>
          <input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /> {option}
        </label>)}
      </fieldset>)}
      <ToastMessage message={error} variant="error" />
      <button type="button" className="button" disabled={busy} onClick={() => void submit()}>Topshirish</button>
    </div>;
  }

  return <div className="container page-shell practice-page">
    <Link href="/learning/practice" className="muted">← Amaliyot</Link>
    <header className="practice-head"><div>
      <span className="eyebrow">Imtihon</span>
      <h1>{exam.title}</h1>
      <p className="muted">{exam.summary}</p>
    </div></header>
    <section className="practice-lock">
      <p>{exam.questionCount} savol · {exam.minutes} daqiqa · o‘tish balli {exam.passPercent}%. Mavzular: {exam.topics.join(", ")}.</p>
      <p className="muted">Vaqt boshlangach to‘xtamaydi. Sahifani yopsangiz ham muddat davom etadi; muddat tugamasa qayta kirib, to‘lovsiz davom ettirishingiz mumkin. Har bir yangi urinish uchun to‘lov qayta olinadi.</p>
      <ul className="practice-reqs">
        {modules.map((item) => <li key={item.slug} className={item.done ? "ok" : ""}>{item.done ? "✓" : "○"} Modul: <Link href={`/learning/${item.slug}`}>{item.title}</Link></li>)}
        {labs.map((item) => <li key={item.slug} className={item.done ? "ok" : ""}>{item.done ? "✓" : "○"} Lab: <Link href={`/learning/labs/${item.slug}`}>{item.title}</Link></li>)}
      </ul>
      {certificateCode && <p>Sizda sertifikat bor: <Link href={`/verify/${certificateCode}`}>{certificateCode}</Link></p>}
      <p>Narx: <strong>{hasOpenAttempt ? "to‘lov olingan" : `${price} TEC`}</strong>{!hasOpenAttempt && price !== listPrice && <s> {listPrice}</s>}. Balansingiz: {tecBalance} TEC.</p>
      <ToastMessage message={error} variant="error" />
      {!ready && !hasOpenAttempt ? <p className="muted">Avval yuqoridagi shartlarni bajaring.</p> :
        !hasOpenAttempt && tecBalance < price ? <Link href="/store" className="button">TEC olish</Link> :
        <button type="button" className="button" disabled={busy} onClick={start}>{hasOpenAttempt ? "Davom ettirish" : `${price} TEC evaziga boshlash`}</button>}
    </section>
  </div>;
}
