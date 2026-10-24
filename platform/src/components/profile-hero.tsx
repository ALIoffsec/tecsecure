"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import type { ProfilePractice } from "@/lib/learning-profile-types";

const copy = {
  uz: {
    noPath: "Siz hali yo'nalish tanlamadingiz.",
    choosePath: "Yo'nalish tanlash",
    rank: "Daraja",
    sections: "Bajarilgan bo'limlar",
    modules: "Tugatilgan modullar",
    tec: "TEC balansi",
    earned: "Ishlangan TEC",
    paths: "Yo'nalishlar progressi",
    history: "So'nggi faoliyat",
    empty: "Hali faoliyat yo'q. Birinchi darsni boshlang.",
    start: "Ta'limni boshlash",
    store: "TEC do'koni",
    skills: "Ko'nikmalar bahosi",
    certificates: "Sertifikatlarim",
    achievements: "Mening yutuqlarim",
    noCertificates: "Hali sertifikat yo'q.",
    examsLink: "Imtihonlarni ko'rish",
    scoreSource: "Baho Tecsecure ichidagi bo'limlar, laboratoriyalar va imtihonlar asosida hisoblanadi (50/30/20). Bu tashqi malaka emas.",
    honest: "Daraja faqat Tecsecure ichidagi o'quv natijalarini ifodalaydi; bu ish tajribasi yoki xalqaro sertifikat emas."
  },
  ru: {
    noPath: "Вы ещё не выбрали направление.",
    choosePath: "Выбрать направление",
    rank: "Ранг",
    sections: "Пройдено разделов",
    modules: "Завершено модулей",
    tec: "Баланс TEC",
    earned: "Заработано TEC",
    paths: "Прогресс по направлениям",
    history: "Последняя активность",
    empty: "Пока нет активности. Начните первый урок.",
    start: "Начать обучение",
    store: "Магазин TEC",
    skills: "Оценка навыков",
    certificates: "Мои сертификаты",
    achievements: "Мои достижения",
    noCertificates: "Сертификатов пока нет.",
    examsLink: "Смотреть экзамены",
    scoreSource: "Оценка строится только на прогрессе внутри Tecsecure: разделы, лаборатории и экзамены (50/30/20). Это не внешняя квалификация.",
    honest: "Ранг отражает только учебный прогресс в Tecsecure; это не опыт работы и не международная сертификация."
  },
  en: {
    noPath: "You haven't chosen a path yet.",
    choosePath: "Choose a path",
    rank: "Rank",
    sections: "Sections completed",
    modules: "Modules completed",
    tec: "TEC balance",
    earned: "TEC earned",
    paths: "Path progress",
    history: "Recent activity",
    empty: "No activity yet. Start your first lesson.",
    start: "Start learning",
    store: "TEC store",
    skills: "Skill rating",
    certificates: "My certificates",
    achievements: "My achievements",
    noCertificates: "No certificates yet.",
    examsLink: "View exams",
    scoreSource: "Score uses only Tecsecure activity: sections, labs, and exams (50/30/20). This is not an external qualification.",
    honest: "Rank reflects only learning progress inside Tecsecure; it is not work experience or an external certification."
  }
};

export function ProfileHero({ name, email, rewardPoints, practice, children }: { name: string; email: string; rewardPoints: number; practice: ProfilePractice; children?: React.ReactNode }) {
  const { locale } = useSitePreferences();
  const c = copy[locale];
  const { profile, progress } = practice;

  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tecsecure-learning-demo-v1") ?? "null");
      if (saved && Array.isArray(saved.paths)) setSelected(saved.paths.filter((item: unknown): item is string => typeof item === "string"));
    } catch { /* ignore corrupt local data */ }
  }, []);


  const stats = useMemo(() => {
    const sections = progress?.completedSections ?? [];
    const completions = progress?.completions ?? [];
    const doneModules = new Set(completions.map((item) => item.moduleSlug));
    const paths = progress?.paths.map((path) => ({
      ...path,
      title: path.title[locale],
      percent: path.total ? Math.round((path.done / path.total) * 100) : 0
    })) ?? [];
    const count = sections.length;
    return { count, modules: doneModules.size, paths, history: completions.slice(0, 5) };
  }, [progress, locale]);

  const xpPercent = profile.levelCeil ? Math.min(100, Math.round(((profile.xp - profile.levelFloor) / (profile.levelCeil - profile.levelFloor)) * 100)) : 100;

  return (
    <section className="htb-profile" aria-label={name}>
      <div className="htb-banner" aria-hidden="true" />
      <div className="htb-corner">{children}</div>
      <div className="htb-head">
        <div className="htb-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</div>
        <div className="htb-identity">
          <h2>{name}</h2>
          <p>{email}</p>
          <div className="htb-rank"><span className="htb-rank-badge">{c.rank} {profile.level}: {profile.levelName}</span>
            <div className="htb-bar" role="progressbar" aria-valuenow={xpPercent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${xpPercent}%` }} /></div>
          </div>
          <div className="htb-xp"><small>{profile.xp} XP{profile.levelCeil ? ` · keyingi daraja: ${profile.levelCeil} XP` : " · eng yuqori daraja"}</small></div>
        </div>
        <div className="htb-links">
          <Link className="button primary" href="/learning">{c.start}</Link>
          <Link className="button secondary" href="/store">{c.store}</Link>
        </div>
      </div>
      <div className="htb-stats">
        <div className="metric"><strong>{stats.count}</strong><span>{c.sections}</span></div>
        <div className="metric"><strong>{stats.modules}</strong><span>{c.modules}</span></div>
        <div className="metric"><strong>{rewardPoints}</strong><span>{c.tec}</span></div>
        <div className="metric"><strong>{progress?.earnedTec ?? 0}</strong><span>{c.earned}</span></div>
      </div>
      <div className="htb-columns">
        <div className="htb-card">
          <h3>{c.paths}</h3>
          {stats.paths.filter((path) => selected.includes(path.slug)).length === 0 && <p>{c.noPath} <Link href="/learning">{c.choosePath}</Link></p>}
          <ul className="htb-paths">
            {stats.paths.filter((path) => selected.includes(path.slug)).map((path) => <li key={path.slug}>
              <div><Link href={`/learning/paths/${path.slug}`}>{path.title}</Link><small>{path.done}/{path.total} · {path.percent}%</small></div>
              <div className="htb-bar"><span style={{ width: `${path.percent}%` }} /></div>
            </li>)}
          </ul>
        </div>
        <div className="htb-card">
          <h3>{c.history}</h3>
          {stats.history.length ? <ul className="htb-timeline">{stats.history.map((item) => <li key={item.moduleSlug + item.completedAt}>
            <strong>{item.title[locale]}</strong>
            <small>{new Date(item.completedAt).toLocaleDateString(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US")} · +{item.rewardTec} TEC</small>
          </li>)}</ul> : <p>{c.empty}</p>}
          <p className="htb-note">{c.honest}</p>
        </div>
      </div>
      <div className="htb-columns">
        <div className="htb-card">
          <h3>{c.skills}</h3>
          {profile.skills.map((skill) => <div className="htb-skill" key={skill.key}>
            <span>{skill.title}</span>
            <div className="htb-bar" role="progressbar" aria-valuenow={skill.score} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${skill.score}%` }} /></div>
            <small>{skill.score}% · {skill.label}</small>
          </div>)}
          <p className="htb-note">{c.scoreSource}</p>
        </div>
        <div className="htb-card">
          <h3>{c.certificates}</h3>
          {practice.certificates.length === 0 ? <p>{c.noCertificates} <Link href="/learning/practice">{c.examsLink}</Link></p> :
            <div className="htb-certs">{practice.certificates.slice(0, 6).map((cert) => {
              return <Link key={cert.code} className="htb-cert" href={`/verify/${cert.code}`}>
                <i style={{ background: cert.accent }} /><span><b style={{ color: cert.accent }}>{cert.acronym}</b><strong>{cert.title}</strong><small>{cert.scorePercent}% · {new Date(cert.issuedAt).toLocaleDateString("uz-UZ")}</small></span>
              </Link>;
            })}</div>}
        </div>
      </div>
      <div className="htb-card">
        <h3>{c.achievements}</h3>
        <div className="htb-ach">{profile.achievements.map((item) => <div key={item.id} className={`htb-ach-item ${item.tone}${item.earned ? "" : " off"}`}>
          <strong>{item.title}</strong><small>{item.hint}</small>
        </div>)}</div>
      </div>
    </section>
  );
}
