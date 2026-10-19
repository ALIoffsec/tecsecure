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
