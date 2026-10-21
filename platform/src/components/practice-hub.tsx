import Link from "next/link";
import { examPriceFor, labPriceFor } from "@/lib/practice-perks";

type HubLab = { slug: string; title: string; summary: string; level: string; minutes: number; priceTec: number; taskCount: number; solved: number; unlocked: boolean; completed: boolean };
type Req = { slug: string; title: string; done: boolean };
type HubExam = { slug: string; title: string; summary: string; feeTec: number; minutes: number; passPercent: number; questionCount: number; topics: string[]; modules: Req[]; labs: Req[]; bestScore: number; passed: boolean };
type HubCert = { code: string; title: string; scorePercent: number; issuedAt: string };

export function PracticeHub({ tecBalance, planKey, labs, exams, certificates }: { tecBalance: number; planKey: string | null; labs: HubLab[]; exams: HubExam[]; certificates: HubCert[] }) {
  return <div className="container page-shell practice-page">
    <header className="practice-head">
      <div>
        <span className="eyebrow">Amaliyot</span>
        <h1>Laboratoriya, imtihon va sertifikat</h1>
        <p className="muted">Darsni o‘qish — boshlanish xolos. Bu yerda real log, skan va konfiguratsiyalarni tahlil qilasiz, so‘ng imtihon topshirib, tekshiriladigan sertifikat olasiz.</p>
      </div>
      <div className="practice-balance"><span>TEC balansi</span><strong>{tecBalance}</strong><small>{planKey ? `Reja: ${planKey}` : "Reja yo‘q"}</small><Link href="/store" className="button secondary">TEC olish</Link></div>
    </header>
    <p className="practice-honest">Laboratoriyalar — dalil tahlili mashqlari (log, skan, konfiguratsiya), jonli virtual mashina emas. Sertifikat — Tecsecure kursini tugatganingizni tasdiqlaydi, ish kafolati emas.</p>

    <h2>Laboratoriyalar</h2>
    <div className="practice-grid">
      {labs.map((lab) => {
        const price = labPriceFor(planKey, lab.priceTec);
        return <article key={lab.slug} className={`practice-card${lab.completed ? " is-done" : ""}`}>
          <div className="practice-tags"><span>{lab.level}</span><span>~{lab.minutes} daqiqa</span><span>{lab.taskCount} topshiriq</span></div>
          <h3>{lab.title}</h3>
          <p>{lab.summary}</p>
          <div className="practice-foot">
            <span className="practice-price">{lab.unlocked ? (lab.completed ? "Yakunlandi ✓" : `${lab.solved}/${lab.taskCount} yechildi`) : price === 0 ? "Bepul (Expert)" : `${price} TEC`}{!lab.unlocked && price !== lab.priceTec && price > 0 && <s>{lab.priceTec}</s>}</span>
            <Link href={`/learning/labs/${lab.slug}`} className="button">{lab.unlocked ? "Davom etish" : "Ko‘rish"}</Link>
          </div>
        </article>;
      })}
    </div>

    <h2>Imtihonlar</h2>
    <div className="practice-grid">
      {exams.map((exam) => {
        const price = examPriceFor(planKey, exam.feeTec);
        const ready = exam.modules.every((item) => item.done) && exam.labs.every((item) => item.done);
        return <article key={exam.slug} className={`practice-card${exam.passed ? " is-done" : ""}`}>
          <div className="practice-tags"><span>{exam.questionCount} savol</span><span>{exam.minutes} daqiqa</span><span>O‘tish: {exam.passPercent}%</span></div>
          <h3>{exam.title}</h3>
          <p>{exam.summary}</p>
          <ul className="practice-reqs">
            {exam.modules.map((item) => <li key={item.slug} className={item.done ? "ok" : ""}>{item.done ? "✓" : "○"} Modul: {item.title}</li>)}
            {exam.labs.map((item) => <li key={item.slug} className={item.done ? "ok" : ""}>{item.done ? "✓" : "○"} Lab: {item.title}</li>)}
          </ul>
          <div className="practice-foot">
            <span className="practice-price">{exam.passed ? `O‘tdingiz · ${exam.bestScore}%` : `${price} TEC`}{!exam.passed && price !== exam.feeTec && <s>{exam.feeTec}</s>}</span>
            <Link href={`/learning/exams/${exam.slug}`} className={`button${ready ? "" : " secondary"}`}>{ready ? "Imtihon" : "Shartlarni ko‘rish"}</Link>
          </div>
        </article>;
      })}
    </div>

    <h2>Sertifikatlarim</h2>
    {certificates.length === 0 ? <p className="muted">Hali sertifikat yo‘q. Imtihondan {exams[0]?.passPercent ?? 70}% va undan yuqori ball olsangiz, tekshiriladigan sertifikat beriladi.</p> :
      <div className="practice-grid">{certificates.map((cert) => <article key={cert.code} className="practice-card is-done">
        <h3>{cert.title}</h3>
        <p>Ball: {cert.scorePercent}% · {new Date(cert.issuedAt).toLocaleDateString("uz-UZ")}</p>
        <div className="practice-foot"><code>{cert.code}</code><Link href={`/verify/${cert.code}`} className="button secondary">Ochish</Link></div>
      </article>)}</div>}
  </div>;
}
