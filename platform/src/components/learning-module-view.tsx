"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ProgressBar, TecAmount, useLearningProgress, useLearningPurchases, useLearningText } from "@/components/learning-shared";
import type { LearningDiagram, LearningImage, LearningSection, Localized } from "@/lib/learning-demo";
import type { LearningModulePreview } from "@/lib/learning-catalog-types";

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

export function LearningModuleView({ module }: { module: LearningModulePreview }) {
  const { tx, pick } = useLearningText();
  const progress = useLearningProgress();
  const access = useLearningPurchases(module.slug);
  const [active, setActive] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "wrong">("idle");
  const [answerError, setAnswerError] = useState("");
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [buying, setBuying] = useState<"MODULE" | number | null>(null);
  const [lesson, setLesson] = useState<LearningLessonData | null>(null);
  const [lessonError, setLessonError] = useState("");
  const positioned = useRef(false);
  const { ready, touch, isDone } = progress;
  const modulePurchase = access.purchases.some((purchase) => purchase.sectionIndex === null);
  const hasAccess = useCallback((index: number) => access.subscriptionAccess || module.sectionPricesTec[index] === 0
    || modulePurchase
    || access.purchases.some((purchase) => purchase.sectionIndex === index), [access.purchases, access.subscriptionAccess, module, modulePurchase]);
  const moduleUnlocked = module.sections.every((_, index) => hasAccess(index));

  useEffect(() => {
    if (!ready || !access.loaded || positioned.current) return;
    positioned.current = true;
    touch(module.slug);
    const firstOpen = module.sections.findIndex((_, index) => hasAccess(index) && !isDone(module.slug, index));
    setActive(firstOpen === -1 ? 0 : firstOpen);
  }, [ready, access.loaded, touch, module, isDone, hasAccess]);

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
    setActive(index);
    setAnswer("");
    setFeedback("idle");
    setAnswerError("");
  }

  async function buyContent(kind: "MODULE" | "SECTION", sectionIndex?: number) {
    setBuying(kind === "MODULE" ? "MODULE" : sectionIndex ?? null);
    await access.purchase(kind, sectionIndex);
    setBuying(null);
  }

  async function submitAnswer(event: FormEvent) {
    event.preventDefault();
    setCheckingAnswer(true);
    setFeedback("idle");
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
        {access.error && <div className="notice error" role="alert">{access.error}</div>}
        {access.notice && <div className="notice success" role="status">{access.notice}</div>}
        {progress.rewardNotice && <div className="notice success" role="status">{progress.rewardNotice}</div>}
        {progress.rewardError && <div className="notice error" role="alert">{progress.rewardError}</div>}
        <ProgressBar percent={status.percent} label={tx.progress} />
        <span className="learn-meta">{tx.progress}: {status.percent}% · {status.done}/{status.total}{status.percent === 100 ? ` · ${tx.moduleDone}` : ""}</span>
      </section>

      <div className="learn-module-layout">
        <aside className="panel-card learn-toc" aria-label={tx.tableOfContents}>
          <strong>{tx.tableOfContents}</strong>
          <ol>
            {module.sections.map((item, index) => (
              <li key={index}>
                <button className={`learn-toc-item${active === index ? " active" : ""}`} onClick={() => select(index)} type="button" aria-current={active === index ? "step" : undefined}>
                  <span className={`learn-check${progress.isDone(module.slug, index) ? " done" : ""}${!hasAccess(index) ? " locked" : ""}`} aria-hidden="true">{progress.isDone(module.slug, index) ? "✓" : !hasAccess(index) ? "◇" : index + 1}</span>
                  <span>{pick(item.title)}</span>
                  {!hasAccess(index) && <span className="learn-toc-price">{module.sectionPricesTec[index]} TEC</span>}
                </button>
              </li>
            ))}
          </ol>
        </aside>

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
            <div className="notice error" role="alert">{lessonError}</div>
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
          {question && (
            <form className="learn-question" onSubmit={submitAnswer}>
              <label htmlFor="learn-answer"><strong>{tx.question}:</strong> {pick(question.prompt)}</label>
              <div className="learn-question-row">
                <input className="input" id="learn-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={tx.answerPlaceholder} disabled={sectionDone} autoComplete="off" />
                <button className="button" disabled={sectionDone || checkingAnswer || !answer.trim()} type="submit">{checkingAnswer ? tx.purchasing : tx.check}</button>
              </div>
              {answerError && <p className="learn-feedback wrong" role="alert">{answerError}</p>}
              {feedback === "wrong" && <p className="learn-feedback wrong" role="alert">{tx.wrong}</p>}
              {sectionDone && <p className="learn-feedback right" role="status">{tx.correct}</p>}
            </form>
          )}
          </>}

          <div className="learn-actions">
            <button className="button ghost" disabled={active === 0} onClick={() => select(active - 1)} type="button">← {tx.previous}</button>
            {!sectionLocked && !question && (
              <button className={`button${sectionDone ? " secondary" : ""}`} disabled={sectionDone || !lesson} onClick={() => progress.complete(module.slug, active)} type="button">
                {sectionDone ? `✓ ${tx.sectionDone}` : tx.markComplete}
              </button>
            )}
            <button className="button ghost" disabled={active === module.sections.length - 1} onClick={() => select(active + 1)} type="button">{tx.next} →</button>
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
          <button className="button secondary" disabled type="button">{tx.labSoon}</button>
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
