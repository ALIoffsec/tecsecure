"use client";

import Link from "next/link";
import { useLearningCatalog } from "@/components/learning-catalog-context";
import { getPathArtCategory, LearningCardArt } from "@/components/learning-card-art";
import { TecGiftNotifications } from "@/components/tec-gift-notifications";
import { ProgressBar, useLearningProgress, useLearningText } from "@/components/learning-shared";
import { ToastMessage } from "@/components/toast-provider";

const xpPerSection = 10;
const xpPerLevel = 100;

export function LearningDashboard({ nickname }: { nickname: string | null }) {
  const { tx, pick } = useLearningText();
  const catalog = useLearningCatalog();
  const progress = useLearningProgress();

  const experience = progress.doneCount * xpPerSection;
  const level = Math.floor(experience / xpPerLevel) + 1;
  const displayName = nickname || tx.learnerName;
  const doneModules = catalog.modules.filter((item) => progress.moduleProgress(item).percent === 100).length;
  const pathStatus = progress.myPaths.map((path) => ({ path, status: progress.pathProgress(path) }));
  const activePaths = pathStatus.filter(({ status }) => status.done > 0 && status.percent < 100).length;
  const resumeModule = progress.last ? catalog.modules.find((module) => module.slug === progress.last) : undefined;
  const resumeStatus = resumeModule ? progress.moduleProgress(resumeModule) : undefined;

  const badges = [
    { label: tx.badgeFirstStep, earned: progress.doneCount >= 1 },
    { label: tx.badgeFirstModule, earned: doneModules >= 1 },
    { label: tx.badgeHalfway, earned: pathStatus.some(({ status }) => status.percent >= 50) },
    { label: tx.badgeFinisher, earned: pathStatus.some(({ status }) => status.percent === 100) }
  ];

  function resetAll() {
    if (window.confirm(tx.resetConfirm)) progress.reset();
  }

  return (
    <div className="container page-shell learn-page">
      <section className="learn-hero learn-profile">
        <div className="learn-avatar" aria-hidden="true">{displayName.charAt(0).toUpperCase()}</div>
        <div>
          <span className="eyebrow">{tx.dashboardTitle}</span>
          <h1 className="page-title">{displayName}</h1>
          <p className="page-intro">{tx.learnerRole} · {tx.moduleRewardText}</p>
        </div>
      </section>
      <div className="learn-stats learn-dash-stats">
        <div className="metric"><strong>{progress.earnedTec}</strong><span>{tx.earnedTec}</span></div>
        <div className="metric"><strong>{experience}</strong><span>{tx.points}</span></div>
        <div className="metric"><strong>{level}</strong><span>{tx.level}</span></div>
        <div className="metric"><strong>{progress.doneCount}</strong><span>{tx.statDoneSections}</span></div>
        <div className="metric"><strong>{doneModules}</strong><span>{tx.statDoneModules}</span></div>
        <div className="metric"><strong>{activePaths}</strong><span>{tx.statActivePaths}</span></div>
      </div>
      <TecGiftNotifications />
      <ToastMessage message={progress.rewardError} variant="error" />
      {!progress.rewardsAvailable && !nickname && (
        <div className="notice learn-reward-sign-in">
          <span>{tx.rewardUnavailable}</span>
          <Link className="button secondary" href="/login">{tx.signInToPurchase}</Link>
        </div>
      )}

      <section className="panel-card learn-block">
        <h2>{tx.resumeTitle}</h2>
        {resumeModule && resumeStatus ? (
          <div className="learn-resume">
            <div>
              <h3>{pick(resumeModule.title)}</h3>
              <ProgressBar percent={resumeStatus.percent} label={tx.progress} />
              <span className="learn-meta">{resumeStatus.percent}% · {resumeStatus.done}/{resumeStatus.total}</span>
            </div>
            <Link className="button" href={`/learning/${resumeModule.slug}`}>{tx.continueLearning}</Link>
          </div>
        ) : (
          <div className="learn-resume"><p className="muted">{tx.resumeEmpty}</p><Link className="button" href="/learning">{tx.browseCatalog}</Link></div>
        )}
      </section>

      <section className="learn-block">
        <div className="section-head learn-section-title"><div><span className="eyebrow">{tx.myPaths}</span></div><Link className="button secondary" href="/learning">{tx.pathsTitle}</Link></div>
        <div className="learn-path-grid">
          {pathStatus.map(({ path, status }) => {
            const firstCategory = catalog.modules.find((module) => module.slug === path.modules[0])?.category ?? "networking";
            return <article className="card learn-path-card" key={path.slug}>
              <Link className="learn-path-card-link" href={`/learning/paths/${path.slug}`}>
              <LearningCardArt category={getPathArtCategory(path.slug, firstCategory)} slug={path.slug} title={pick(path.title)} kind="path" />
              <div className="learn-tags"><span className="tag learn-kind">{path.kind === "jobRole" ? tx.jobRole : tx.skillPath}</span><span className="tag">{path.modules.length} {tx.modulesCount}</span></div>
              <h3>{pick(path.title)}</h3>
              <p>{pick(path.summary)}</p>
              <ProgressBar percent={status.percent} label={tx.progress} />
              <div className="learn-meta">{status.percent}% · {status.done}/{status.total}</div>
              <strong className="learn-modules-button">{tx.modulesButton} · {path.modules.length}</strong>
              </Link>
              <button className="button ghost learn-path-remove" onClick={() => progress.togglePath(path.slug)} type="button">{tx.removePath}</button>
            </article>;
          })}
          {pathStatus.length === 0 && <div className="panel-card learn-empty-paths"><p className="muted">{tx.emptyMyPaths}</p><Link className="button" href="/learning">{tx.pathsTitle}</Link></div>}
        </div>
      </section>

      <section className="learn-block">
        <div className="section-head"><div><span className="eyebrow">{tx.badges}</span></div></div>
        <div className="learn-badges">
          {badges.map((badge) => (
            <div className={`learn-badge${badge.earned ? " earned" : ""}`} key={badge.label}>
              <span aria-hidden="true">{badge.earned ? "★" : "☆"}</span>
              <strong>{badge.label}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="learn-block">
        <div className="section-head"><div><span className="eyebrow">{tx.certificates}</span></div></div>
        <div className="learn-path-grid">
          {pathStatus.map(({ path, status }) => (
            <div className={`panel-card learn-cert${status.percent === 100 ? " ready" : ""}`} key={path.slug}>
              <strong>{pick(path.title)}</strong>
              <span className="muted small">{status.percent === 100 ? tx.certificateReady : tx.certificateLocked}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="learn-footer-row">
        <span className="muted small">{tx.storedLocally}</span>
        <button className="button danger" onClick={resetAll} type="button">{tx.resetProgress}</button>
      </div>
    </div>
  );
}
