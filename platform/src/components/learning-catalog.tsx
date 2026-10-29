"use client";

import Link from "next/link";
import { useState } from "react";
import { useLearningCatalog } from "@/components/learning-catalog-context";
import { getPathArtCategory, LearningCardArt } from "@/components/learning-card-art";
import { ProgressBar, TecAmount, useLearningProgress, useLearningText } from "@/components/learning-shared";
import { UiIcon } from "@/components/ui-icon";
import type { Category, Difficulty } from "@/lib/learning-demo";
import type { LearningModulePreview } from "@/lib/learning-catalog-types";
import type { VulNyxCatalogResult } from "@/lib/vulnyx-catalog";

const difficultyOrder: Difficulty[] = ["fundamental", "easy", "medium", "hard"];
const categoryOrder: Category[] = ["networking", "systems", "security", "physical"];
type PublicLabPreview = { slug: string; title: string; summary: string; level: string; minutes: number; taskCount: number };
type PublicExamPreview = { slug: string; title: string; summary: string; minutes: number; passPercent: number; questionCount: number; topics: string[] };
type LearningCatalogProps =
  | { section: "overview" | "paths" | "modules" }
  | { section: "labs"; labs: PublicLabPreview[] }
  | { section: "exams"; exams: PublicExamPreview[] }
  | { section: "ctf"; vulnyx: VulNyxCatalogResult };

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

export function LearningCatalog(props: LearningCatalogProps) {
  const { tx, pick, locale } = useLearningText();
  const catalog = useLearningCatalog();
  const progress = useLearningProgress();
  const section = props.section;
  const labs = section === "labs" ? props.labs : null;
  const exams = section === "exams" ? props.exams : null;
  const vulnyx = section === "ctf" ? props.vulnyx : null;
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [machineQuery, setMachineQuery] = useState("");
  const [machineOs, setMachineOs] = useState("all");
  const [machineDifficulty, setMachineDifficulty] = useState("all");

  const visible = catalog.modules.filter((item) =>
    (difficulty === "all" || item.difficulty === difficulty) && (category === "all" || item.category === category));
  const machines = vulnyx?.status === "ready" ? vulnyx.machines : [];
  const normalizedQuery = machineQuery.trim().toLocaleLowerCase(locale);
  const visibleMachines = machines.filter((machine) =>
    (machineOs === "all" || machine.os === machineOs)
    && (machineDifficulty === "all" || machine.difficulty === machineDifficulty)
    && (!normalizedQuery || `${machine.name} ${machine.creator} ${machine.os}`.toLocaleLowerCase(locale).includes(normalizedQuery)));
  const machineOperatingSystems = [...new Set(machines.map((machine) => machine.os))].sort();
  const machineDifficulties = [...new Set(machines.map((machine) => machine.difficulty))].sort();
  const difficultyLabel = (value: string) => {
    switch (value.toLowerCase()) {
      case "easy": return tx.ctfDifficulty.easy;
      case "low": return tx.ctfDifficulty.low;
      case "medium": return tx.ctfDifficulty.medium;
      case "hard": return tx.ctfDifficulty.hard;
      default: return value;
    }
  };
  const labLevelLabel = (value: string) => {
    if (value === "boshlang‘ich") return tx.labLevel.beginner;
    if (value === "o‘rta") return tx.labLevel.intermediate;
    return tx.labLevel.advanced;
  };

  return (
    <div className="container page-shell learn-page">
      {section === "overview" && (
        <>
          <section className="learn-home-hero">
            <div className="learn-home-hero-copy">
              <span className="eyebrow">{tx.learningHomeEyebrow}</span>
              <h1 className="page-title">{tx.learningHomeTitle}</h1>
              <p className="page-intro">{tx.learningHomeDescription}</p>
              <p className="learn-home-account-note"><UiIcon name="user" size={18} /><span>{tx.learningHomeAccountNote}</span></p>
              <div className="hero-actions">
                <Link className="button" href="/learning/paths"><UiIcon name="network" size={18} />{tx.learningHomeStart}</Link>
                <Link className="button secondary" href="/learning/dashboard"><UiIcon name="layout" size={18} />{tx.openDashboard}</Link>
              </div>
            </div>
            <aside className="learn-home-summary" aria-label={tx.learningHomeSummary}>
              <span className="eyebrow">{tx.learningHomeSummary}</span>
              <div className="learn-home-stats">
                <div className="metric"><strong>{catalog.paths.length}</strong><span>{tx.statPaths}</span></div>
                <div className="metric"><strong>{catalog.modules.length}</strong><span>{tx.statModules}</span></div>
                <div className="metric"><strong>{catalog.modules.reduce((total, module) => total + module.sections.length, 0)}</strong><span>{tx.statSections}</span></div>
              </div>
              <p>{tx.learningHomeStatsNote}</p>
            </aside>
          </section>

          <section className="learn-home-catalog">
            <div className="learn-home-section-heading">
              <div><span className="eyebrow">{tx.eyebrow}</span><h2>{tx.learningHomeSectionsTitle}</h2></div>
              <p>{tx.learningHomeSectionsDescription}</p>
            </div>
            <nav aria-label={tx.catalogMenuTitle} className="learn-catalog-grid">
              <Link className="learn-catalog-tile card" href="/learning/paths">
                <span className="learn-catalog-tile-heading"><UiIcon name="network" /><strong>{tx.catalogPaths}</strong></span>
                <p>{tx.catalogPathsDescription}</p>
                <span className="learn-catalog-tile-action">{tx.learningHomeOpenSection}<span aria-hidden="true">→</span></span>
              </Link>
              <Link className="learn-catalog-tile card" href="/learning/modules">
                <span className="learn-catalog-tile-heading"><UiIcon name="book" /><strong>{tx.catalogModules}</strong></span>
                <p>{tx.catalogModulesDescription}</p>
                <span className="learn-catalog-tile-action">{tx.learningHomeOpenSection}<span aria-hidden="true">→</span></span>
              </Link>
              <Link className="learn-catalog-tile card" href="/learning/practice/labs">
                <span className="learn-catalog-tile-heading"><UiIcon name="toolbox" /><strong>{tx.catalogLabs}</strong></span>
                <p>{tx.catalogLabsDescription}</p>
                <span className="learn-catalog-tile-action">{tx.learningHomeOpenSection}<span aria-hidden="true">→</span></span>
              </Link>
              <Link className="learn-catalog-tile card" href="/learning/exams">
                <span className="learn-catalog-tile-heading"><UiIcon name="clipboard" /><strong>{tx.catalogExams}</strong></span>
                <p>{tx.catalogExamsDescription}</p>
                <span className="learn-catalog-tile-action">{tx.learningHomeOpenSection}<span aria-hidden="true">→</span></span>
              </Link>
              <Link className="learn-catalog-tile card" href="/learning/ctf">
                <span className="learn-catalog-tile-heading"><UiIcon name="shield" /><strong>{tx.catalogCtf}</strong></span>
                <p>{tx.catalogCtfDescription}</p>
                <span className="learn-catalog-tile-action">{tx.learningHomeOpenSection}<span aria-hidden="true">→</span></span>
              </Link>
              <Link className="learn-catalog-tile card" href="/learning/dashboard">
                <span className="learn-catalog-tile-heading"><UiIcon name="user" /><strong>{tx.catalogProgress}</strong></span>
                <p>{tx.catalogMyPractice}</p>
                <span className="learn-catalog-tile-action">{tx.learningHomeOpenSection}<span aria-hidden="true">→</span></span>
              </Link>
            </nav>
          </section>

          <section className="learn-home-steps">
            <div className="learn-home-section-heading">
              <div><span className="eyebrow">{tx.eyebrow}</span><h2>{tx.learningHomeStepsTitle}</h2></div>
            </div>
            <div className="learn-home-step-grid">
              <article className="learn-home-step card"><span>01</span><h3>{tx.learningHomeStepOneTitle}</h3><p>{tx.learningHomeStepOneDescription}</p></article>
              <article className="learn-home-step card"><span>02</span><h3>{tx.learningHomeStepTwoTitle}</h3><p>{tx.learningHomeStepTwoDescription}</p></article>
              <article className="learn-home-step card"><span>03</span><h3>{tx.learningHomeStepThreeTitle}</h3><p>{tx.learningHomeStepThreeDescription}</p></article>
            </div>
            <p className="learn-home-disclaimer">{tx.learningHomeDisclaimer}</p>
          </section>
        </>
      )}

      {section === "paths" && <section className="learn-block">
        <div className="section-head learn-section-title">
          <div><span className="eyebrow">{tx.eyebrow}</span><h1 className="page-title">{tx.pathsTitle}</h1></div>
          <Link className="button secondary" href="/learning/dashboard">{tx.openDashboard}</Link>
        </div>
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
      </section>}

      {labs && <section className="learn-block">
        <div className="section-head learn-section-title">
          <div><span className="eyebrow">{tx.eyebrow}</span><h1 className="page-title">{tx.labsTitle}</h1></div>
          <Link className="button secondary" href="/learning/practice/labs">{tx.labsOpen}</Link>
        </div>
        <p className="learn-source-note">{tx.labsIntro}</p>
        {labs.length === 0 ? <p className="muted">{tx.labsEmpty}</p> : (
          <div className="learn-lab-preview-grid">
            {labs.map((lab) => (
              <article className="learn-lab-preview card" key={lab.slug}>
                <div className="learn-tags">
                  <span className="tag">{labLevelLabel(lab.level)}</span>
                  <span className="tag">{lab.minutes} {tx.labMinutes}</span>
                  <span className="tag">{lab.taskCount} {tx.labTasks}</span>
                </div>
                <h3>{lab.title}</h3>
                <p>{lab.summary}</p>
                <Link className="button secondary learn-catalog-item-action" href={`/learning/labs/${lab.slug}`}>{tx.catalogOpenItem}</Link>
              </article>
            ))}
          </div>
        )}
      </section>}

      {exams && <section className="learn-block">
        <div className="section-head learn-section-title">
          <div><span className="eyebrow">{tx.eyebrow}</span><h1 className="page-title">{tx.catalogExams}</h1></div>
          <Link className="button secondary" href="/learning/practice/exams">{tx.examsOpen}</Link>
        </div>
        <p className="learn-source-note">{tx.catalogExamsDescription}</p>
        {exams.length === 0 ? <p className="muted">{tx.examsEmpty}</p> : (
          <div className="learn-exam-preview-grid">
            {exams.map((exam) => (
              <article className="learn-exam-preview card" key={exam.slug}>
                <div className="learn-tags">
                  <span className="tag">{exam.questionCount} {tx.examQuestions}</span>
                  <span className="tag">{exam.minutes} {tx.labMinutes}</span>
                  <span className="tag">{tx.examPassRate}: {exam.passPercent}%</span>
                </div>
                <h3>{exam.title}</h3>
                <p>{exam.summary}</p>
                {exam.topics.length > 0 && <p className="learn-meta">{exam.topics.join(" · ")}</p>}
                <Link className="button secondary learn-catalog-item-action" href={`/learning/exams/${exam.slug}`}>{tx.catalogStartExam}</Link>
              </article>
            ))}
          </div>
        )}
      </section>}

      {vulnyx && <section className="learn-block">
        <div className="section-head learn-section-title">
          <div><span className="eyebrow">{tx.eyebrow}</span><h1 className="page-title">{tx.ctfTitle}</h1></div>
          <a className="button secondary" href="https://vulnyx.com/machines/" rel="noopener noreferrer" target="_blank">{tx.ctfOpenAll}</a>
        </div>
        <p className="learn-source-note">{tx.ctfSourceNote}</p>
        <p className="learn-ctf-safety">{tx.ctfSafety}</p>
        <p className="learn-ctf-availability">{tx.ctfRetiredInfo} {tx.ctfAvailabilityNote}</p>
        <div className="learn-source-links">
          <a href="https://github.com/ct0l4/vulnyx.github.io/blob/main/_data/db.yml" rel="noopener noreferrer" target="_blank">{tx.ctfRepository}</a>
          <a href="https://github.com/ct0l4/vulnyx.github.io/blob/main/LICENSE" rel="noopener noreferrer" target="_blank">GPL-3.0</a>
          {vulnyx.status === "ready" && <span>{vulnyx.machines.length} {tx.ctfDownloadsListed}</span>}
        </div>
        {vulnyx.status === "unavailable" ? <p className="learn-ctf-unavailable" role="status">{tx.ctfLoadFailed}</p> : (
          <>
            <div className="learn-ctf-controls">
              <label>
                <span className="sr-only">{tx.ctfSearchLabel}</span>
                <input
                  aria-label={tx.ctfSearchLabel}
                  onChange={(event) => setMachineQuery(event.target.value)}
                  placeholder={tx.ctfSearchPlaceholder}
                  type="search"
                  value={machineQuery}
                />
              </label>
              <label>
                <span className="sr-only">{tx.ctfOsFilter}</span>
                <select aria-label={tx.ctfOsFilter} onChange={(event) => setMachineOs(event.target.value)} value={machineOs}>
                  <option value="all">{tx.ctfAllOs}</option>
                  {machineOperatingSystems.map((os) => <option key={os} value={os}>{os}</option>)}
                </select>
              </label>
              <label>
                <span className="sr-only">{tx.ctfDifficultyFilter}</span>
                <select aria-label={tx.ctfDifficultyFilter} onChange={(event) => setMachineDifficulty(event.target.value)} value={machineDifficulty}>
                  <option value="all">{tx.ctfAllDifficulty}</option>
                  {machineDifficulties.map((level) => <option key={level} value={level}>{difficultyLabel(level)}</option>)}
                </select>
              </label>
            </div>
            {visibleMachines.length === 0 ? <p className="muted">{tx.ctfNoResults}</p> : (
              <div className="learn-ctf-grid">
                {visibleMachines.map((machine) => {
                  const retired = machine.status?.toLowerCase() === "retired";
                  return <article className="learn-ctf-card card" key={machine.slug}>
                    <div className="learn-tags">
                      <span className="tag">{machine.os}</span>
                      <span className="tag">{difficultyLabel(machine.difficulty)}</span>
                      {machine.status && <span className={`tag${retired ? " learn-ctf-retired" : ""}`}>{retired ? tx.ctfRetired : machine.status}</span>}
                    </div>
                    <h3>{machine.name}</h3>
                    <p className="learn-meta">{tx.ctfCreator}: {machine.creator}</p>
                    <div className="learn-ctf-details">
                      {machine.size && <span>{tx.ctfSize}: {machine.size}</span>}
                      {machine.release && <span>{tx.ctfRelease}: {machine.release}</span>}
                    </div>
                    <a className="button learn-ctf-download" href={machine.downloadUrl} rel="noopener noreferrer" target="_blank">
                      <UiIcon name="download" size={17} />
                      <span>{tx.ctfDownload}</span>
                    </a>
                  </article>;
                })}
              </div>
            )}
          </>
        )}
      </section>}

      {section === "modules" && <section className="learn-block">
        <div className="section-head"><div><span className="eyebrow">{tx.eyebrow}</span><h1 className="page-title">{tx.modulesTitle}</h1></div></div>
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
      </section>}
    </div>
  );
}
