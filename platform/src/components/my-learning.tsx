"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { UiIcon, type IconName } from "./ui-icon";
import { ActivityBars } from "./activity-bars";
import { SkillRadar } from "./skill-radar";
import { formatDate, formatNumber } from "@/lib/format";
import { LEVEL_NAMES, WEEKLY_GOAL_XP } from "@/lib/learning-xp";
import type { MyLearningData } from "@/lib/learning-profile-server";

const words = {
  uz: {
    title: "Mening o‘qishim", stage: (n: number) => `${n}-bosqich`, toNext: (n: number) => `keyingi darajaga ${n} XP`, goal: "Haftalik maqsad", streak: "Ketma-ket hafta", weeks: (n: number) => `${n} hafta`,
    skills: "Ko‘nikmalar", skillsDesc: "Har yo‘nalishda olingan XP mumkin bo‘lgan XP ga nisbatan, 0–100", skillsEmpty: "Birinchi modulni tugating — ko‘nikmalaringiz shu yerda chiziladi.", skillsAction: "Modullar",
    modules: "Modullar", paths: "Yo‘llar", certificates: "Sertifikatlar", labs: "Laboratoriyalar", pickPath: "Yo‘l tanlang", certs: (n: number) => `${n} ta`, firstExam: "Birinchi imtihon", ofDone: (a: number, b: number) => `${a} / ${b}`,
    resume: "Davom ettirish", lesson: (n: number, title: string) => `${n}-dars: ${title}`, finished: "Modul tugatildi — keyingisini tanlang", resumeEmpty: "Hali dars boshlanmagan.", start: "Birinchi modul",
    xp: "XP (12 hafta)", xpSummary: (avg: number, total: number) => `O‘rtacha ${avg} XP/hafta · jami ${total} XP`, weekOf: "hafta",
    axes: { net: "Tarmoq", sys: "Linux", win: "Windows/AD", sec: "Veb", soc: "SOC", iot: "CCTV/IoT" } as Record<string, string>
  },
  ru: {
    title: "Моё обучение", stage: (n: number) => `${n}-й этап`, toNext: (n: number) => `до следующего уровня ${n} XP`, goal: "Цель недели", streak: "Недель подряд", weeks: (n: number) => `${n} нед.`,
    skills: "Навыки", skillsDesc: "Набранный XP к возможному XP по каждому направлению, 0–100", skillsEmpty: "Завершите первый модуль — навыки появятся здесь.", skillsAction: "Модули",
    modules: "Модули", paths: "Пути", certificates: "Сертификаты", labs: "Лаборатории", pickPath: "Выберите путь", certs: (n: number) => `${n} шт.`, firstExam: "Первый экзамен", ofDone: (a: number, b: number) => `${a} / ${b}`,
    resume: "Продолжить", lesson: (n: number, title: string) => `Урок ${n}: ${title}`, finished: "Модуль пройден — выберите следующий", resumeEmpty: "Уроки ещё не начаты.", start: "Первый модуль",
    xp: "XP (12 недель)", xpSummary: (avg: number, total: number) => `В среднем ${avg} XP/нед. · всего ${total} XP`, weekOf: "неделя",
    axes: { net: "Сети", sys: "Linux", win: "Windows/AD", sec: "Веб", soc: "SOC", iot: "CCTV/IoT" } as Record<string, string>
  },
  en: {
    title: "My learning", stage: (n: number) => `stage ${n}`, toNext: (n: number) => `${n} XP to the next level`, goal: "Weekly goal", streak: "Weeks in a row", weeks: (n: number) => `${n} week${n === 1 ? "" : "s"}`,
    skills: "Skills", skillsDesc: "XP earned over XP possible in each area, 0–100", skillsEmpty: "Finish your first module — your skills will be drawn here.", skillsAction: "Modules",
    modules: "Modules", paths: "Paths", certificates: "Certificates", labs: "Labs", pickPath: "Pick a path", certs: (n: number) => `${n}`, firstExam: "First exam", ofDone: (a: number, b: number) => `${a} / ${b}`,
    resume: "Continue", lesson: (n: number, title: string) => `Lesson ${n}: ${title}`, finished: "Module finished — pick the next one", resumeEmpty: "No lesson started yet.", start: "First module",
    xp: "XP (12 weeks)", xpSummary: (avg: number, total: number) => `Average ${avg} XP/week · ${total} XP in total`, weekOf: "week of",
    axes: { net: "Network", sys: "Linux", win: "Windows/AD", sec: "Web", soc: "SOC", iot: "CCTV/IoT" } as Record<string, string>
  }
} as const;

/**
 * The signed-in learning home: the level card, skills, the four sections, where to continue, and XP by week.
 * The title is large at the top and shrinks into a glass bar on scroll.
 */
export function MyLearning({ data }: { data: MyLearningData }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const sentinel = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const element = sentinel.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const watcher = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting), { rootMargin: "-64px 0px 0px 0px" });
    watcher.observe(element);
    return () => watcher.disconnect();
  }, []);
  const level = data.level;
  const levelName = LEVEL_NAMES[locale][level.nameIndex];
  const axes = data.skills.map(skill => ({ label: w.axes[skill.key] ?? skill.key, score: skill.score }));
  const anySkill = axes.some(axis => axis.score > 0);
  const total = data.weeks.reduce((sum, week) => sum + week.xp, 0);
  const average = Math.round(total / Math.max(1, data.weeks.length));
  const tiles: { href: string; icon: IconName; label: string; line: string }[] = [
    { href: "/learning/modules", icon: "book", label: w.modules, line: w.ofDone(data.tiles.modules.done, data.tiles.modules.total) },
    { href: data.tiles.path ? `/learning/paths/${data.tiles.path.slug}` : "/learning/paths", icon: "network", label: w.paths, line: data.tiles.path ? `${data.tiles.path.title[locale]} · ${data.tiles.path.percent}%` : w.pickPath },
    { href: "/learning/certifications", icon: "shield", label: w.certificates, line: data.tiles.certificates ? w.certs(data.tiles.certificates) : w.firstExam },
    { href: "/learning/labs", icon: "toolbox", label: w.labs, line: w.ofDone(data.tiles.labs.done, data.tiles.labs.total) }
  ];
  return <div className="learn-home">
    <div ref={sentinel} aria-hidden="true" />
    <div className={`learn-home-bar${compact ? " is-compact" : ""}`}><h1 className="learn-home-title" tabIndex={-1}>{w.title}</h1></div>

    <section className="learn-level-card" aria-label={`${levelName} · ${w.stage(level.stage)}`}>
      <div className="learn-level-top">
        <span className="learn-level-ring" aria-hidden="true"><small>Lvl</small><strong>{level.level}</strong></span>
        <span className="learn-level-text">
          <strong>{levelName} · {w.stage(level.stage)}</strong>
          <span className="learn-xp-track" role="progressbar" aria-valuemin={level.floor} aria-valuemax={level.ceil} aria-valuenow={data.xp} aria-label="XP"><span className="learn-xp-fill" style={{ width: `${level.percent}%` }} /></span>
          <small>{formatNumber(data.xp, 0)} / {formatNumber(level.ceil, 0)} XP · {w.toNext(level.toNext)}</small>
        </span>
      </div>
      <div className="learn-level-stats">
        <p><small>{w.goal}</small><strong>{data.weekXp} / {WEEKLY_GOAL_XP} XP</strong></p>
        <p><small>{w.streak}</small><strong>{w.weeks(data.streak)}</strong></p>
      </div>
    </section>

    <section className="panel-card learn-skills" aria-labelledby="learn-skills">
      <h2 id="learn-skills">{w.skills}</h2>
      {anySkill
        ? <SkillRadar axes={axes} title={w.skills} description={w.skillsDesc} />
        : <p className="muted">{w.skillsEmpty} <Link className="text-link" href="/learning/modules">{w.skillsAction}</Link></p>}
    </section>

    <nav className="learn-tiles" aria-label={w.title}>
      <ul>{tiles.map(tile => <li key={tile.href}><Link className="learn-tile" href={tile.href}>
        <span className="learn-tile-icon" aria-hidden="true"><UiIcon name={tile.icon} size={20} /></span>
        <strong>{tile.label}</strong>
        <small>{tile.line}</small>
      </Link></li>)}</ul>
    </nav>

    <section className="panel-card learn-resume-card" aria-labelledby="learn-resume">
      <div className="learn-resume-head"><h2 id="learn-resume">{w.resume}</h2>{data.resume && <span className="muted">{data.resume.title[locale]}</span>}</div>
      {data.resume
        ? <>
          <p>{data.resume.lesson ? w.lesson(data.resume.lesson.number, data.resume.lesson.title[locale]) : w.finished}</p>
          <Link className="button learn-resume-button" href={data.resume.lesson ? `/learning/${data.resume.slug}` : "/learning/modules"}>{w.resume}</Link>
        </>
        : <><p className="muted">{w.resumeEmpty}</p><Link className="button learn-resume-button" href="/learning/modules">{w.start}</Link></>}
    </section>

    <section className="panel-card learn-xp-weeks" aria-labelledby="learn-xp">
      <h2 id="learn-xp">{w.xp}</h2>
      <ActivityBars label={w.xp} unit="XP" bars={data.weeks.map(week => ({ key: week.start, short: formatDate(week.start).slice(0, 5), long: `${w.weekOf} ${formatDate(week.start)}`, value: week.xp }))} />
      <p className="small muted">{w.xpSummary(average, total)}</p>
    </section>
  </div>;
}
