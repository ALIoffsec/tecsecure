"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { learningModules, learningPaths } from "@/lib/learning-demo";

type Progress = {
  completedSections: { moduleSlug: string; sectionIndex: number }[];
  completions: { moduleSlug: string; rewardTec: number; completedAt: string }[];
  earnedTec: number;
};

const copy = {
  uz: { noPath: "Siz hali yo'nalish tanlamadingiz.", choosePath: "Yo'nalish tanlash", rank: "Daraja", sections: "Bajarilgan bo'limlar", modules: "Tugatilgan modullar", tec: "TEC balansi", earned: "Ishlangan TEC", paths: "Yo'nalishlar progressi", history: "So'nggi faoliyat", empty: "Hali faoliyat yo'q. Birinchi darsni boshlang.", start: "Ta'limni boshlash", store: "TEC do'koni", wallet: "Hamyon", badges: "Yutuqlar", none: "Hali yutuq yo'q", done: "modul", ranks: ["Yangi", "O'quvchi", "Amaliyotchi", "Tajribali", "Mutaxassis"], badgeNames: { first: "Birinchi dars", five: "5 ta bo'lim", module: "Birinchi modul", path: "Yo'nalish tugatildi" }, honest: "Daraja faqat tugatilgan bo'limlarni sanaydi; bu ish tajribasi yoki sertifikat emas." },
  ru: { noPath: "Вы ещё не выбрали направление.", choosePath: "Выбрать направление", rank: "Ранг", sections: "Пройдено разделов", modules: "Завершено модулей", tec: "Баланс TEC", earned: "Заработано TEC", paths: "Прогресс по направлениям", history: "Последняя активность", empty: "Пока нет активности. Начните первый урок.", start: "Начать обучение", store: "Магазин TEC", wallet: "Кошелёк", badges: "Достижения", none: "Пока нет достижений", done: "мод.", ranks: ["Новичок", "Ученик", "Практик", "Опытный", "Специалист"], badgeNames: { first: "Первый урок", five: "5 разделов", module: "Первый модуль", path: "Направление пройдено" }, honest: "Ранг считает только пройденные разделы; это не опыт работы и не сертификат." },
  en: { noPath: "You haven't chosen a path yet.", choosePath: "Choose a path", rank: "Rank", sections: "Sections completed", modules: "Modules completed", tec: "TEC balance", earned: "TEC earned", paths: "Path progress", history: "Recent activity", empty: "No activity yet. Start your first lesson.", start: "Start learning", store: "TEC store", wallet: "Wallet", badges: "Achievements", none: "No achievements yet", done: "mod.", ranks: ["Newcomer", "Learner", "Practitioner", "Experienced", "Specialist"], badgeNames: { first: "First lesson", five: "5 sections", module: "First module", path: "Path completed" }, honest: "Rank only counts completed sections; it is not work experience or a certificate." }
};

export function ProfileHero({ name, email, rewardPoints, children }: { name: string; email: string; rewardPoints: number; children?: React.ReactNode }) {
  const { locale } = useSitePreferences();
  const c = copy[locale];
  const [progress, setProgress] = useState<Progress | null>(null);

  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tecsecure-learning-demo-v1") ?? "null");
      if (saved && Array.isArray(saved.paths)) setSelected(saved.paths.filter((item: unknown): item is string => typeof item === "string"));
    } catch { /* ignore corrupt local data */ }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/learning/progress", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => { if (active && data) setProgress(data); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => {
    const sections = progress?.completedSections ?? [];
    const completions = progress?.completions ?? [];
    const doneKeys = new Set(sections.map((item) => `${item.moduleSlug}:${item.sectionIndex}`));
    const doneModules = new Set(completions.map((item) => item.moduleSlug));
    const paths = learningPaths.map((path) => {
      const modules = path.modules.map((slug) => learningModules.find((item) => item.slug === slug)).filter((item): item is NonNullable<typeof item> => Boolean(item));
      const total = modules.reduce((sum, item) => sum + item.sections.length, 0);
      const done = modules.reduce((sum, item) => sum + item.sections.filter((_, index) => doneKeys.has(`${item.slug}:${index}`)).length, 0);
      return { slug: path.slug, title: path.title[locale], total, done, percent: total ? Math.round((done / total) * 100) : 0, finished: total > 0 && done === total };
    });
    const count = sections.length;
    const rankIndex = count >= 60 ? 4 : count >= 30 ? 3 : count >= 12 ? 2 : count >= 1 ? 1 : 0;
    const badges = [
      count >= 1 && c.badgeNames.first,
      count >= 5 && c.badgeNames.five,
      doneModules.size >= 1 && c.badgeNames.module,
      paths.some((item) => item.finished) && c.badgeNames.path
    ].filter(Boolean) as string[];
    return { count, modules: doneModules.size, paths, rankIndex, badges, history: completions.slice(0, 5) };
  }, [progress, locale, c]);

  const nextRankAt = [1, 12, 30, 60, 60][stats.rankIndex];
  const rankPercent = stats.rankIndex === 4 ? 100 : Math.min(100, Math.round((stats.count / nextRankAt) * 100));

  return (
    <section className="htb-profile" aria-label={name}>
      <div className="htb-banner" aria-hidden="true" />
      <div className="htb-corner">{children}</div>
      <div className="htb-head">
        <div className="htb-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</div>
        <div className="htb-identity">
          <h2>{name}</h2>
          <p>{email}</p>
          <div className="htb-rank"><span className="htb-rank-badge">{c.rank}: {c.ranks[stats.rankIndex]}</span>
            <div className="htb-bar" role="progressbar" aria-valuenow={rankPercent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${rankPercent}%` }} /></div>
          </div>
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
          <h3>{c.badges}</h3>
          <div className="htb-badges">{stats.badges.length ? stats.badges.map((badge) => <span key={badge} className="htb-badge">{badge}</span>) : <p>{c.none}</p>}</div>
          <h3>{c.history}</h3>
          {stats.history.length ? <ul className="htb-timeline">{stats.history.map((item) => <li key={item.moduleSlug + item.completedAt}>
            <strong>{learningModules.find((module) => module.slug === item.moduleSlug)?.title[locale] ?? item.moduleSlug}</strong>
            <small>{new Date(item.completedAt).toLocaleDateString(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US")} · +{item.rewardTec} TEC</small>
          </li>)}</ul> : <p>{c.empty}</p>}
          <p className="htb-note">{c.honest}</p>
        </div>
      </div>
    </section>
  );
}
