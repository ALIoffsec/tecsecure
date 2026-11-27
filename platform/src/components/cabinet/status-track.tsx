import { UiIcon } from "@/components/ui-icon";
import { formatDate } from "@/lib/format";

export type TrackStep = { label: string; at: Date | string | null };

/**
 * One progress line for orders and requests: passed steps carry a check (with "done" for screen readers), the
 * current one `aria-current="step"`, and only real dates. Across on a computer, down the page on a phone.
 */
export function StatusTrack({ steps, current, label, doneText }: { steps: TrackStep[]; current: number; label: string; doneText: string }) {
  return <ol className="cab-steps" aria-label={label}>
    {steps.map((step, index) => {
      const passed = index < current || (index === current && index === steps.length - 1);
      return <li key={step.label} className={`${index <= current ? "is-reached" : ""}${index === current ? " is-current" : ""}`.trim() || undefined} aria-current={index === current ? "step" : undefined}>
        <span className="cab-step-dot" aria-hidden="true">{passed ? <UiIcon name="check" size={16} /> : index + 1}</span>
        <span className="cab-step-text">
          <span>{step.label}{passed && <span className="sr-only"> · {doneText}</span>}</span>
          {step.at && <small>{formatDate(step.at)}</small>}
        </span>
      </li>;
    })}
  </ol>;
}
