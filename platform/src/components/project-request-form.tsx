"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";

type CatalogItem = { id: string; name: string; kind: "product" | "service" };

export function ProjectRequestForm({ catalog }: { catalog: CatalogItem[] }) {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const selectedId = String(data.get("item") ?? "");
    const item = catalog.find((candidate) => `${candidate.kind}:${candidate.id}` === selectedId);
    const items = item ? [{
      [item.kind === "product" ? "productId" : "serviceId"]: item.id,
      quantity: Number(data.get("quantity") || 1)
    }] : [];
    const body = { name: data.get("name"), city: data.get("city"), notes: data.get("notes"), items };
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? t("requestFailed"));
        return;
      }
      form.reset();
      setNotice(t("projectQuoteSubmitted"));
      router.refresh();
    } catch {
      setError(t("serverUnavailable"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="field"><label htmlFor="project-name">{t("projectName")} *</label><input id="project-name" name="name" required minLength={2} maxLength={160} /></div>
      <div className="field"><label htmlFor="project-city">{t("city")}</label><input id="project-city" name="city" maxLength={100} /></div>
      <div className="field">
        <label htmlFor="project-item">{t("chooseProductService")}</label>
        <select id="project-item" name="item" defaultValue="">
          <option value="">{t("noSelection")}</option>
          {catalog.map((item) => <option key={`${item.kind}:${item.id}`} value={`${item.kind}:${item.id}`}>{item.name}</option>)}
        </select>
      </div>
      <div className="field"><label htmlFor="project-quantity">{t("quantity")}</label><input id="project-quantity" name="quantity" type="number" min="1" max="1000" defaultValue="1" /></div>
      <div className="field"><label htmlFor="project-notes">{t("projectRequirements")}</label><textarea id="project-notes" name="notes" maxLength={3000} /></div>
      <ToastMessage message={notice} variant="success" />
      <ToastMessage message={error} variant="error" />
      <button className="button" disabled={busy}>{busy ? t("sending") : t("sendQuoteRequest")}</button>
    </form>
  );
}
