"use client";

import Link from "next/link";
import { useLearningCatalog } from "@/components/learning-catalog-context";
import { LearningCardArt } from "@/components/learning-card-art";
import { ProgressBar, useLearningProgress, useLearningText } from "@/components/learning-shared";
import type { LearningModulePreview } from "@/lib/learning-catalog-types";
import type { LearningPath } from "@/lib/learning-demo";

export function LearningPathView({ path }: { path: LearningPath }) {
  const { tx, pick } = useLearningText();
  const catalog = useLearningCatalog();
  const progress = useLearningProgress();
  const status = progress.pathProgress(path);
  const modules = path.modules.map((slug) => catalog.modules.find((module) => module.slug === slug)).filter((item): item is LearningModulePreview => Boolean(item));

  return (
    <div className="container page-shell learn-page">
      <section className="learn-hero">
        <span className="eyebrow">{tx.pathsTitle}</span>
        <h1 className="page-title">{pick(path.title)}</h1>
        <p className="page-intro">{pick(path.summary)}</p>
        <div className="dashboard-grid learning-path-details">
          <div className="metric"><strong>{tx.timeEstimateLabel}</strong><span>{pick(path.timeEstimate)}</span></div>
          <div className="metric"><strong>{tx.prerequisitesLabel}</strong><span>{pick(path.prerequisites)}</span></div>
          <div className="metric"><strong>{tx.outcomesLabel}</strong><span>{pick(path.outcomes)}</span></div>
          <div className="metric"><strong>{tx.capstoneLabel}</strong><span>{pick(path.capstone)}</span></div>
        </div>
        <p className="small muted">{tx.deliveryDisclaimer}</p>
        <div className="notice">
          <strong>{pick({ uz: "Yo‘nalishni tugatgach nima qila olasiz — halol javob", ru: "Что вы сможете после курса — честно", en: "What you can do after this path — honestly" })}</strong>
          <ul>
            <li>{pick({ uz: "Mavzular bo‘yicha tushuncha, terminologiya va xavfsiz o‘z laboratoriyangizda takrorlash tartibini bilasiz.", ru: "Вы понимаете темы, терминологию и умеете безопасно повторять практику в собственной лаборатории.", en: "You understand the topics and terminology and can repeat practice safely in your own lab." })}</li>
            <li>{pick({ uz: "Yakuniy loyiha natijasi (sxema, hisobot, checklist) portfolioga qo‘yiladigan ish namunasi bo‘ladi.", ru: "Результат итогового проекта (схема, отчёт, чек-лист) станет образцом для портфолио.", en: "The capstone output (diagram, report, checklist) becomes a portfolio sample." })}</li>
            <li>{pick({ uz: "Platforma hozircha laboratoriya, ustoz bahosi yoki sertifikat bermaydi — ish bilan ta’minlash yoki senior darajasi va’da qilinmaydi.", ru: "Платформа пока не предоставляет лаборатории, оценку преподавателя или сертификат; трудоустройство и уровень senior не обещаются.", en: "The platform does not yet provide hosted labs, instructor grading, or certificates; employment or senior level is not promised." })}</li>
          </ul>
        </div>
        <div className="hero-actions">
          <a className="button secondary" href="#path-modules">{tx.modulesButton}</a>
          <button
            aria-pressed={progress.selectedPaths.includes(path.slug)}
            className="button"
            disabled={!progress.ready}
            onClick={() => progress.togglePath(path.slug)}
            type="button"
          >
            {progress.selectedPaths.includes(path.slug) ? `✓ ${tx.removePath}` : `+ ${tx.addPath}`}
          </button>
        </div>
        <div className="learn-path-progress">
          <ProgressBar percent={status.percent} label={tx.progress} />
          <span className="learn-meta">{tx.progress}: {status.percent}% · {status.done}/{status.total}</span>
        </div>
      </section>

      <section className="learn-block" id="path-modules">
        <div className="section-head"><div><span className="eyebrow">{tx.pathIncludes}</span></div></div>
        <ol className="learn-path-list">
          {modules.map((module, index) => {
            const moduleStatus = progress.moduleProgress(module);
            return (
              <li className="panel-card card learn-path-item" key={module.slug}>
                <span className="learn-step" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div className="learn-path-item-body">
                  <LearningCardArt category={module.category} slug={module.slug} title={pick(module.title)} />
                  <div className="learn-tags">
                    <span className={`tag learn-level learn-level-${module.difficulty}`}>{tx.difficulty[module.difficulty]}</span>
                    <span className="tag">{module.sections.length} {tx.sectionsCount}</span>
                    {module.modulePriceTec === 0 ? <span className="tag learn-free-tag">{tx.free}</span> : <span className="tag">{tx.bundlePrice}: {module.modulePriceTec} TEC</span>}
                  </div>
                  <h3>{pick(module.title)}</h3>
                  <p>{pick(module.summary)}</p>
                  <ProgressBar percent={moduleStatus.percent} label={tx.progress} />
                </div>
                <Link className="button secondary" href={`/learning/${module.slug}`}>
                  {moduleStatus.percent === 100 ? tx.completed : moduleStatus.done ? tx.continueLearning : tx.start}
                </Link>
              </li>
            );
          })}
        </ol>
        <Link className="button ghost" href="/learning">{tx.backToCatalog}</Link>
      </section>
    </div>
  );
}
