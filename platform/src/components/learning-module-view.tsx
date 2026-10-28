"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ProgressBar, TecAmount, useLearningProgress, useLearningPurchases, useLearningText } from "@/components/learning-shared";
import { LinuxVirtualTerminal } from "@/components/linux-virtual-terminal";
import { GuidedPracticeTerminal } from "@/components/guided-practice-terminal";
import { ToastMessage } from "@/components/toast-provider";
import type { LearningDiagram, LearningImage, LearningSection, Localized } from "@/lib/learning-demo";
import type { LearningModulePreview } from "@/lib/learning-catalog-types";

type LinuxPracticeProgress = {
  tasksBySection: Record<number, string[]>;
  completedSections: number[];
};

type LearningLessonData = Omit<LearningSection, "question"> & {
  expandedContent?: string;
  diagram?: LearningDiagram;
  question?: { prompt: Localized };
  example?: Localized;
  exampleExplanation?: Localized;
};

function DiagramText({ value, x, y, className }: { value: string; x: number; y: number; className: string }) {
  return (
    <text className={className} x={x} y={y} textAnchor="middle">
      {value.split("\n").map((line, index) => (
        <tspan key={`${index}-${line}`} x={x} dy={index === 0 ? 0 : 17}>{line}</tspan>
      ))}
    </text>
  );
}

function LearningDiagramFigure({ diagram, moduleSlug, pick }: {
  diagram: LearningDiagram;
  moduleSlug: string;
  pick: (value: Localized) => string;
}) {
  const isCli = diagram.kind === "cli-modes";
  const centers = isCli ? [100, 306, 512, 718] : [82, 268, 454, 640, 826];
  const width = isCli ? 150 : 128;
  const top = isCli ? 76 : 116;
  const height = isCli ? 60 : 64;
  const markerId = `learning-arrow-${moduleSlug}`;

  return (
    <figure className="learn-diagram">
      <figcaption>{pick(diagram.caption)}</figcaption>
      <svg
        className="learn-diagram-svg"
        viewBox={isCli ? "0 0 820 170" : "0 0 910 205"}
        role="img"
        aria-label={pick(diagram.caption)}
      >
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
          </marker>
        </defs>
        {diagram.links.map((link, index) => {
          const mid = (centers[index] + centers[index + 1]) / 2;
          const lines = pick(link).split("\n");
          return (
            <g key={`${index}-${pick(link)}`}>
              <line
                x1={centers[index] + width / 2 + 3}
                y1={top + height / 2}
                x2={centers[index + 1] - width / 2 - 3}
                y2={top + height / 2}
                markerEnd={`url(#${markerId})`}
              />
              <DiagramText
                className="learn-diagram-link"
                value={lines.join("\n")}
                x={mid}
                y={isCli ? 57 : 85}
              />
            </g>
          );
        })}
        {diagram.nodes.map((node, index) => {
          const x = centers[index] - width / 2;
          const lines = pick(node).split("\n");
          return (
            <g key={`${index}-${pick(node)}`}>
              <rect className={`learn-diagram-node${index === 0 ? " source" : index === diagram.nodes.length - 1 ? " outcome" : " control"}`} x={x} y={top} width={width} height={height} rx="12" />
              <DiagramText
                className="learn-diagram-label"
                value={lines.join("\n")}
                x={centers[index]}
                y={top + height / 2 - ((lines.length - 1) * 8)}
              />
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function LearningScreenshot({ image, pick }: {
  image: LearningImage;
  pick: (value: Localized) => string;
}) {
  return (
    <figure className="learn-screenshot">
      <Image
        className="learn-screenshot-image"
        src={image.src}
        alt={pick(image.alt)}
        width={image.width}
        height={image.height}
        loading="eager"
        sizes="(max-width: 700px) 100vw, (max-width: 1200px) 85vw, 1100px"
      />
      <figcaption>{pick(image.caption)}</figcaption>
    </figure>
  );
}

function renderInline(text: string, keyPrefix: string) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={key}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={key}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

function LearningRichText({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const key = `lesson-block-${elements.length}`;
    if (line.startsWith("### ")) {
      elements.push(<h3 key={key}>{line.slice(4)}</h3>);
      index += 1;
      continue;
    }
    if (line.startsWith("```")) {
      index += 1;
      const codeLines: string[] = [];
      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      elements.push(<pre className="learn-code" key={key}><code>{codeLines.join("\n")}</code></pre>);
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].startsWith("- ")) {
        items.push(lines[index].slice(2));
        index += 1;
      }
      elements.push(<ul key={key}>{items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{renderInline(item, key)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s/, ""));
        index += 1;
      }
      elements.push(<ol key={key}>{items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{renderInline(item, key)}</li>)}</ol>);
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith("### ") &&
      !lines[index].startsWith("```") &&
      !lines[index].startsWith("- ") &&
      !/^\d+\.\s/.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    elements.push(<p className="muted" key={key}>{renderInline(paragraph.join(" "), key)}</p>);
  }

  return (
    <div className="learn-rich-content">{elements}</div>
  );
}

export function LearningModuleView({ module, nickname }: { module: LearningModulePreview; nickname: string }) {
  const { tx, pick } = useLearningText();
  const progress = useLearningProgress();
  const access = useLearningPurchases(module.slug);
  const [active, setActive] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "wrong">("idle");
  const [completionNotice, setCompletionNotice] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [buying, setBuying] = useState<"MODULE" | number | null>(null);
  const [lesson, setLesson] = useState<LearningLessonData | null>(null);
  const [lessonError, setLessonError] = useState("");
  const [practiceProgress, setPracticeProgress] = useState<LinuxPracticeProgress>({ tasksBySection: {}, completedSections: [] });
  const [practiceProgressModule, setPracticeProgressModule] = useState<string | null>(null);
  const positioned = useRef(false);
  const tocDialogRef = useRef<HTMLDialogElement>(null);
  const { ready, touch, isDone } = progress;
  const isLinuxCourse = module.slug === "linux-fundamentals";
  const practiceProgressReady = practiceProgressModule === module.slug;
  const modulePurchase = access.purchases.some((purchase) => purchase.sectionIndex === null);
  const hasAccess = useCallback((index: number) => access.subscriptionAccess || module.sectionPricesTec[index] === 0
    || modulePurchase
    || access.purchases.some((purchase) => purchase.sectionIndex === index), [access.purchases, access.subscriptionAccess, module, modulePurchase]);
  const moduleUnlocked = module.sections.every((_, index) => hasAccess(index));

  useEffect(() => {
    setPracticeProgressModule(null);
    try {
      const saved = localStorage.getItem(`tecsecure-learning-practice:${module.slug}`);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<LinuxPracticeProgress>;
        if (parsed.tasksBySection && Array.isArray(parsed.completedSections)) {
          setPracticeProgress({
            tasksBySection: parsed.tasksBySection,
            completedSections: parsed.completedSections.filter(Number.isInteger)
          });
        } else {
          setPracticeProgress({ tasksBySection: {}, completedSections: [] });
        }
      } else {
        setPracticeProgress({ tasksBySection: {}, completedSections: [] });
      }
    } catch {
      setPracticeProgress({ tasksBySection: {}, completedSections: [] });
    }
    setPracticeProgressModule(module.slug);
  }, [module.slug]);

  useEffect(() => {
    if (!practiceProgressReady) return;
    localStorage.setItem(`tecsecure-learning-practice:${module.slug}`, JSON.stringify(practiceProgress));
  }, [module.slug, practiceProgress, practiceProgressReady]);

  useEffect(() => {
    if (!ready || !access.loaded || !practiceProgressReady || positioned.current) return;
    positioned.current = true;
    touch(module.slug);
    const firstOpen = module.sections.findIndex((_, index) => hasAccess(index) && !isDone(module.slug, index) && canOpenSection(index));
    setActive(firstOpen === -1 ? 0 : firstOpen);
  }, [ready, access.loaded, practiceProgressReady, touch, module, isDone, hasAccess]);

  const section = module.sections[active];
  const sectionLocked = !hasAccess(active);
  const sectionPrice = module.sectionPricesTec[active];
  const individualTotal = module.individualPriceTec;
  const bundlePrice = module.modulePriceTec;
  const diagram = lesson?.diagram;
  const question = lesson?.question;
  const example = lesson?.example;
  const exampleExplanation = lesson?.exampleExplanation;
  const status = progress.moduleProgress(module);
  const sectionDone = progress.isDone(module.slug, active);
  const terminalPractice = isLinuxCourse ? lesson?.terminalPractice : undefined;
  const interactivePractice = lesson?.interactivePractice;
  const completedTerminalTasks = practiceProgress.tasksBySection[active] ?? [];
  const completedPracticeTasks = practiceProgress.tasksBySection[active] ?? [];
  const practiceRequired = Boolean(section?.requiresPractice);
  const terminalPracticeDone = !isLinuxCourse || !practiceRequired || (
    Boolean(terminalPractice?.tasks.length)
    && practiceProgress.completedSections.includes(active)
  );
  const interactivePracticeDone = !interactivePractice || (
    Boolean(interactivePractice?.tasks.length)
    && practiceProgress.completedSections.includes(active)
  );
  const sectionPracticeDone = terminalPracticeDone && interactivePracticeDone;

  function canOpenSection(index: number) {
    if (index === 0) return true;
    if (!practiceProgressReady) return false;
    return module.sections.slice(0, index).every((previousSection, previousIndex) =>
      progress.isDone(module.slug, previousIndex)
      && (!previousSection.requiresPractice || practiceProgress.completedSections.includes(previousIndex))
    );
  }

  function completeTerminalTask(sectionIndex: number, taskId: string, allComplete: boolean) {
    setPracticeProgress((current) => {
      const currentTasks = current.tasksBySection[sectionIndex] ?? [];
      const tasksBySection = {
        ...current.tasksBySection,
        [sectionIndex]: currentTasks.includes(taskId) ? currentTasks : [...currentTasks, taskId]
      };
      const completedSections = allComplete && !current.completedSections.includes(sectionIndex)
        ? [...current.completedSections, sectionIndex]
        : current.completedSections;
      return { tasksBySection, completedSections };
    });
  }

  useEffect(() => {
    if (sectionLocked) {
      setLesson(null);
      setLessonError("");
      return;
    }
    let current = true;
    setLesson(null);
    setLessonError("");
    fetch(`/api/learning/modules/${encodeURIComponent(module.slug)}/sections/${active}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? tx.purchaseFailed);
        return result.lesson as LearningLessonData;
      })
      .then((result) => {
        if (current) setLesson(result);
      })
      .catch((error: unknown) => {
        if (current) setLessonError(error instanceof Error ? error.message : tx.purchaseFailed);
      });
    return () => { current = false; };
  }, [active, module.slug, sectionLocked, tx.purchaseFailed]);

  function select(index: number) {
    if (!canOpenSection(index)) return;
    setActive(index);
    tocDialogRef.current?.close();
    setAnswer("");
    setFeedback("idle");
    setCompletionNotice("");
    setAnswerError("");
  }

  async function buyContent(kind: "MODULE" | "SECTION", sectionIndex?: number) {
    setBuying(kind === "MODULE" ? "MODULE" : sectionIndex ?? null);
    await access.purchase(kind, sectionIndex);
    setBuying(null);
  }

  async function submitAnswer(event: FormEvent) {
    event.preventDefault();
    if (!sectionPracticeDone) {
      setAnswerError("Darsni yakunlashdan oldin virtual terminaldagi barcha buyruqlarni bajaring.");
      return;
    }
    setCheckingAnswer(true);
    setFeedback("idle");
    setCompletionNotice("");
    setAnswerError("");
    try {
      const response = await fetch("/api/learning/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleSlug: module.slug, sectionIndex: active, answer })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? tx.purchaseFailed);
      if (!result.correct) {
        setFeedback("wrong");
        return;
      }
      const saved = await progress.complete(module.slug, active, answer);
      if (!saved) return;
      setCompletionNotice(tx.correct);
    } catch (issue) {
      setAnswerError(issue instanceof Error ? issue.message : tx.purchaseFailed);
    } finally {
      setCheckingAnswer(false);
    }
  }

  return (
    <div className="container page-shell learn-page">
      <section className="learn-hero learn-module-head">
        <div className="learn-tags">
          <span className={`tag learn-level learn-level-${module.difficulty}`}>{tx.difficulty[module.difficulty]}</span>
          <span className="tag">{tx.category[module.category]}</span>
        </div>
        <h1 className="page-title">{pick(module.title)}</h1>
        <p className="page-intro">{pick(module.summary)}</p>
        <div className="learn-module-purchase">
          <div className="learn-module-price-summary">
            <span>{bundlePrice === 0 ? tx.free : <><strong>{tx.bundlePrice}</strong> <TecAmount amount={bundlePrice} /> <span className="learn-discount">{tx.bundleDiscount}</span></>}</span>
            {bundlePrice > 0 && <span className="muted">{tx.sectionPrice}: {individualTotal} TEC</span>}
          </div>
          {access.authenticated && <span className="learn-meta">{tx.tecBalance}: <TecAmount amount={access.tecBalance} /></span>}
          {access.authenticated && !moduleUnlocked && bundlePrice > access.tecBalance && <Link className="button ghost" href="/portal/profile">{tx.goToWallet}</Link>}
          {bundlePrice > 0 && !moduleUnlocked && (
            access.authenticated
              ? <button className="button" type="button" disabled={!access.loaded || buying !== null} onClick={() => void buyContent("MODULE")}>
                  {buying === "MODULE" ? tx.purchasing : <>{tx.unlockModule} · <TecAmount amount={bundlePrice} /></>}
                </button>
              : access.error
                ? <span className="muted">{tx.purchaseUnavailable}</span>
                : <Link className="button secondary" href="/login">{tx.signInToPurchase}</Link>
          )}
        </div>
        <ToastMessage message={access.error} variant="error" />
        <ToastMessage message={access.notice} variant="success" />
        <ToastMessage message={progress.rewardNotice} variant="success" />
        <ToastMessage message={progress.rewardError} variant="error" />
        <ProgressBar percent={status.percent} label={tx.progress} />
        <span className="learn-meta">{tx.progress}: {status.percent}% · {status.done}/{status.total}{status.percent === 100 ? ` · ${tx.moduleDone}` : ""}</span>
      </section>

      <div className="learn-toc-launcher">
        <button
          className="learn-toc-launcher-button"
          type="button"
          aria-haspopup="dialog"
          aria-controls={`learn-toc-dialog-${module.slug}`}
          onClick={() => {
            const dialog = tocDialogRef.current;
            if (dialog && !dialog.open) dialog.showModal();
          }}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="4" width="17" height="16" rx="3" />
            <path d="M8 8h8M8 12h8M8 16h5" />
            <path d="M6 8h.01M6 12h.01M6 16h.01" />
          </svg>
          <span className="learn-toc-launcher-label">{tx.tableOfContents}</span>
          <span className="learn-toc-launcher-current">
            <span>{active + 1} / {module.sections.length}</span>
            <span>{pick(section.title)}</span>
          </span>
          <span className="learn-toc-launcher-chevron" aria-hidden="true">⌄</span>
        </button>
      </div>

      <dialog
        className="learn-toc-dialog"
        id={`learn-toc-dialog-${module.slug}`}
        ref={tocDialogRef}
        aria-labelledby={`learn-toc-dialog-title-${module.slug}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) tocDialogRef.current?.close();
        }}
      >
        <div className="learn-toc-dialog-panel">
          <header className="learn-toc-dialog-header">
            <div>
              <span className="eyebrow">{active + 1} / {module.sections.length}</span>
              <h2 id={`learn-toc-dialog-title-${module.slug}`}>{tx.tableOfContents}</h2>
              <p>{pick(module.title)}</p>
            </div>
            <button className="button ghost learn-toc-dialog-close" type="button" onClick={() => tocDialogRef.current?.close()}>
              {tx.closeTableOfContents}
            </button>
          </header>
          <ol className="learn-toc-dialog-list">
            {module.sections.map((item, index) => (
              <li key={index}>
                <button className={`learn-toc-item${active === index ? " active" : ""}`} onClick={() => select(index)} type="button" aria-current={active === index ? "step" : undefined} disabled={!canOpenSection(index)}>
                  <span className={`learn-check${progress.isDone(module.slug, index) ? " done" : ""}${!hasAccess(index) ? " locked" : ""}`} aria-hidden="true">{progress.isDone(module.slug, index) ? "✓" : !hasAccess(index) ? "◇" : index + 1}</span>
                  <span>{pick(item.title)}</span>
                  {!hasAccess(index) && <span className="learn-toc-price">{module.sectionPricesTec[index]} TEC</span>}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </dialog>

      <div className="learn-module-layout">
        <article className="panel-card learn-content">
          <span className="eyebrow">{active + 1} / {module.sections.length}</span>
          <h2>{pick(section.title)}</h2>
          {sectionLocked ? (
            <div className="learn-locked-content">
              <p className="muted">{tx.lockedLesson}</p>
              <div className="learn-section-unlock-price"><span>{tx.sectionPrice}</span><TecAmount amount={sectionPrice} /></div>
              {access.authenticated
                ? <>
                    <button className="button" type="button" disabled={!access.loaded || buying !== null} onClick={() => void buyContent("SECTION", active)}>
                      {buying === active ? tx.purchasing : <>{tx.unlockSection} · <TecAmount amount={sectionPrice} /></>}
                    </button>
                    {access.tecBalance < sectionPrice && <Link className="button ghost" href="/portal/profile">{tx.goToWallet}</Link>}
                  </>
                : access.error
                  ? <span className="muted">{tx.purchaseUnavailable}</span>
                  : <Link className="button secondary" href="/login">{tx.signInToPurchase}</Link>}
            </div>
          ) : lessonError ? (
            <ToastMessage message={lessonError} variant="error" />
          ) : !lesson ? (
            <p className="muted" role="status">{tx.purchasing}</p>
          ) : <>
          {lesson.content ? (
            <div className="learn-section-copy">
              {pick(lesson.content).split("\n\n").map((paragraph, index) => (
                <p className="muted" key={index}>{paragraph}</p>
              ))}
            </div>
          ) : !lesson.expandedContent ? (
            <p className="muted">{tx.sectionBody}</p>
          ) : null}
          {lesson.expandedContent && <LearningRichText content={lesson.expandedContent} />}
          {lesson.images?.map((image) => (
            <LearningScreenshot key={image.src} image={image} pick={pick} />
          ))}
          {diagram && <LearningDiagramFigure diagram={diagram} moduleSlug={module.slug} pick={pick} />}
          {example && (
            <div className="learn-example">
              <strong>{tx.exampleTitle}</strong>
              <pre className="learn-code"><code>{pick(example)}</code></pre>
              {exampleExplanation && <p className="muted">{pick(exampleExplanation)}</p>}
            </div>
          )}
          {terminalPractice && (
            <LinuxVirtualTerminal
              key={`${module.slug}-${active}`}
              practice={terminalPractice}
              completedTaskIds={completedTerminalTasks}
              nickname={nickname}
              onTaskComplete={(taskId, allComplete) => completeTerminalTask(active, taskId, allComplete)}
            />
          )}
          {interactivePractice && (
            <GuidedPracticeTerminal
              key={`${module.slug}-${active}-interactive`}
              practice={interactivePractice}
              completedTaskIds={completedPracticeTasks}
              nickname={nickname}
              onTaskComplete={(taskId, allComplete) => completeTerminalTask(active, taskId, allComplete)}
            />
          )}
          {practiceRequired && !sectionPracticeDone && (
            <p className="linux-terminal-required" role="status">
              Darsni yakunlash uchun virtual laboratoriyadagi barcha amaliy vazifalarni bajaring.
            </p>
          )}
          {question && (
            <form className="learn-question" onSubmit={submitAnswer}>
              <label htmlFor="learn-answer"><strong>{tx.question}:</strong> {pick(question.prompt)}</label>
              <div className="learn-question-row">
                <input className="input" id="learn-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={tx.answerPlaceholder} disabled={sectionDone || !sectionPracticeDone} autoComplete="off" />
                <button className="button" disabled={sectionDone || checkingAnswer || !answer.trim() || !sectionPracticeDone} type="submit">{checkingAnswer ? tx.purchasing : tx.check}</button>
              </div>
              <ToastMessage message={answerError} variant="error" />
              <ToastMessage message={feedback === "wrong" ? tx.wrong : ""} variant="error" />
              <ToastMessage message={completionNotice} variant="success" />
            </form>
          )}
          </>}

          <div className="learn-actions">
            <button className="button ghost" disabled={active === 0} onClick={() => select(active - 1)} type="button">← {tx.previous}</button>
            {!sectionLocked && !question && (
              <button className={`button${sectionDone ? " secondary" : ""}`} disabled={sectionDone || !lesson || !sectionPracticeDone} onClick={() => progress.complete(module.slug, active)} type="button">
                {sectionDone ? `✓ ${tx.sectionDone}` : tx.markComplete}
              </button>
            )}
            <button className="button ghost" disabled={active === module.sections.length - 1 || !sectionDone || !sectionPracticeDone || !canOpenSection(active + 1)} onClick={() => select(active + 1)} type="button">{tx.next} →</button>
          </div>
        </article>
      </div>

      {module.hasLab && (
        <section className="panel-card learn-lab">
          <div>
            <span className="eyebrow">{tx.labTitle}</span>
            <p className="muted">{tx.labDescription}</p>
            {module.labPlan && <p className="muted">{pick(module.labPlan)}</p>}
          </div>
          <Link className="button secondary" href={`/learning/practice/labs?module=${encodeURIComponent(module.slug)}`}>
            {tx.openModuleLabs}
          </Link>
        </section>
      )}

      {module.references && module.references.length > 0 && (
        <section className="panel-card learn-references">
          <h2>{tx.referencesTitle}</h2>
          <ul>
            {module.references.map((reference) => (
              <li key={reference.href}>
                <a href={reference.href} rel="noreferrer" target="_blank">{pick(reference.label)}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link className="button ghost" href="/learning">{tx.backToCatalog}</Link>
    </div>
  );
}
