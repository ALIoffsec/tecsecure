"use client";

import type { Ref } from "react";

export function OriginalOrderButton({ ref, busy, disabled, label, pending, success }: {
  ref: Ref<HTMLButtonElement>; busy: boolean; disabled: boolean; label: string; pending: string; success: string;
}) {
  return <div className="original-order-wrap">
    <button ref={ref} className="original-order" type="submit" disabled={disabled} aria-busy={busy} aria-label={busy ? pending : label}>
      <span className="default" aria-hidden="true">{label}</span>
      <span className="success" aria-hidden="true">{success}<svg viewBox="0 0 12 10"><polyline points="1.5 6 4.5 9 10.5 1" /></svg></span>
      <div className="truck" aria-hidden="true"><div className="wheel" /><div className="back" /><div className="front" /><div className="box" /><i className="spray" /><i className="spray" /><i className="spray" /></div>
    </button>
    <span className="original-order-ring" aria-hidden="true" />
    {busy && <span className="small muted" role="status">{pending}</span>}
  </div>;
}
