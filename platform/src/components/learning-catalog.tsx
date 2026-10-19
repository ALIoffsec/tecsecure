"use client";

import Link from "next/link";
import { useState } from "react";
import { useLearningCatalog } from "@/components/learning-catalog-context";
import { getPathArtCategory, LearningCardArt } from "@/components/learning-card-art";
import { ProgressBar, TecAmount, useLearningProgress, useLearningText } from "@/components/learning-shared";
import type { Category, Difficulty } from "@/lib/learning-demo";
import type { LearningModulePreview } from "@/lib/learning-catalog-types";

const difficultyOrder: Difficulty[] = ["fundamental", "easy", "medium", "hard"];
const categoryOrder: Category[] = ["networking", "systems", "security", "physical"];

export function ModuleCard({ module, percent }: { module: LearningModulePreview; percent: number }) {
  const { tx, pick } = useLearningText();
  return (
    <article className="card learn-module-card">
      <Link className="learn-module-card-link" href={`/learning/${module.slug}`}>
      <LearningCardArt category={module.category} slug={module.slug} title={pick(module.title)} />
      <div className="learn-tags">
        <span className={`tag learn-level learn-level-${module.difficulty}`}>{tx.difficulty[module.difficulty]}</span>
        <span className="tag">{tx.category[module.category]}</span>
        {module.hasLab && <span className="tag">{tx.hasLab}</span>}
      </div>
      <h3>{pick(module.title)}</h3>
      <p>{pick(module.summary)}</p>
      <div className="learn-meta">{module.sections.length} {tx.sectionsCount}</div>
      <div className="learn-card-price">
        {module.modulePriceTec === 0 ? <span className="tag learn-free-tag">{tx.free}</span> : <TecAmount amount={module.modulePriceTec} />}
        <span className="muted">{tx.bundlePrice}</span>
      </div>
      <ProgressBar percent={percent} label={tx.progress} />
      </Link>
    </article>
  );
}

export function LearningCatalog() {
  const { tx, pick } = useLearningText();
  const catalog = useLearningCatalog();
  const progress = useLearningProgress();
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");

  const visible = catalog.modules.filter((item) =>
    (difficulty === "all" || item.difficulty === difficulty) && (category === "all" || item.category === category));

  return (
    <div className="container page-shell learn-page">
      <section className="learn-hero">
        <span className="eyebrow">{tx.eyebrow}</span>
        <h1 className="page-title">{tx.title}</h1>
        <p className="page-intro">{tx.intro}</p>
        <div className="hero-actions">
          <Link className="button" href="/learning/dashboard">{tx.openDashboard}</Link>
          <a className="button secondary" href="#learn-modules">{tx.browseCatalog}</a>
        </div>
        <div className="learn-stats">
          <div className="metric"><strong>{catalog.paths.length}</strong><span>{tx.statPaths}</span></div>
          <div className="metric"><strong>{catalog.modules.length}</strong><span>{tx.statModules}</span></div>
          <div className="metric"><strong>{catalog.modules.reduce((total, module) => total + module.sections.length, 0)}</strong><span>{tx.statSections}</span></div>
        </div>
      </section>

      <section className="learn-block">
        <div className="section-head learn-section-title"><div><span className="eyebrow">{tx.pathsTitle}</span></div><Link className="button secondary" href="/learning/dashboard">{tx.openDashboard}</Link></div>
        <div className="learn-path-grid">
          {catalog.paths.map((path) => {
            const status = progress.pathProgress(path);
            const firstCategory = catalog.modules.find((module) => module.slug === path.modules[0])?.category ?? "networking";
            const selected = progress.selectedPaths.includes(path.slug);
            return (
              <article className="card learn-path-card" key={path.slug}>
                <Link className="learn-path-card-link" href={`/learning/paths/${path.slug}`}>
                <LearningCardArt category={getPathArtCategory(path.slug, firstCategory)} slug={path.slug} title={pick(path.title)} kind="path" />
                <div className="learn-tags">
                  <span className="tag learn-kind">{path.kind === "jobRole" ? tx.jobRole : tx.skillPath}</span>
                  <span className="tag">{path.modules.length} {tx.modulesCount}</span>
                </div>
                <h3>{pick(path.title)}</h3>
                <p>{pick(path.summary)}</p>
                <ProgressBar percent={status.percent} label={tx.progress} />
                <div className="learn-meta">{status.percent}% · {status.done}/{status.total}</div>
                </Link>
                <button
                  aria-label={`${selected ? tx.removePath : tx.addPath}: ${pick(path.title)}`}
                  aria-pressed={selected}
                  className={`learn-path-add${selected ? " selected" : ""}`}
                  disabled={!progress.ready}
                  onClick={() => progress.togglePath(path.slug)}
                  title={selected ? tx.removePath : tx.addPath}
                  type="button"
                >{selected ? "✓" : "+"}</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="learn-block" id="learn-modules">
        <div className="section-head"><div><span className="eyebrow">{tx.modulesTitle}</span></div></div>
        <div className="learn-filters" role="group" aria-label={tx.modulesTitle}>
          {(["all", ...difficultyOrder] as const).map((item) => (
            <button className={`learn-chip${difficulty === item ? " active" : ""}`} key={item} onClick={() => setDifficulty(item)} type="button">
              {item === "all" ? tx.all : tx.difficulty[item]}
            </button>
          ))}
        </div>
        <div className="learn-filters">
          {(["all", ...categoryOrder] as const).map((item) => (
            <button className={`learn-chip${category === item ? " active" : ""}`} key={item} onClick={() => setCategory(item)} type="button">
              {item === "all" ? tx.all : tx.category[item]}
            </button>
          ))}
        </div>
        <div className="learn-module-grid">
          {visible.map((module) => <ModuleCard key={module.slug} module={module} percent={progress.moduleProgress(module).percent} />)}
        </div>
      </section>
    </div>
  );
}
