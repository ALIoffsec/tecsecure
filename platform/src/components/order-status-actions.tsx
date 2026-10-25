"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { nextStatuses, orderStatusLabels, type OrderStatusValue } from "@/lib/orders";
import { ToastMessage } from "@/components/toast-provider";

export function OrderStatusActions({ id, status }: { id: string; status: OrderStatusValue }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const options = nextStatuses(status);
  if (options.length === 0) return null;
  async function change(next: OrderStatusValue) {
    setBusy(true);
    setError("");
    const response = await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    setBusy(false);
    if (!response.ok) { setError((await response.json().catch(() => ({}))).error ?? "Xatolik"); return; }
    router.refresh();
  }
  return <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
    {options.map((next) => <button key={next} type="button" className={next === "CANCELLED" ? "button secondary" : "button"} disabled={busy} onClick={() => change(next)}>{orderStatusLabels[next]}</button>)}
    <ToastMessage message={error} variant="error" />
  </div>;
}
