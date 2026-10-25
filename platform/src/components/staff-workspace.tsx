"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";

type RequestRecord = { id: string; reference: string; name: string; phone: string; email: string | null; description: string; status: string; service: { name: string } | null };
type Project = { id: string; name: string; status: string; city: string | null; items: { id: string; quantity: number; product: { name: string } | null; service: { name: string } | null }[] };

const requestStatuses = ["UNDER_REVIEW", "CONTACTED", "INSPECTION_REQUIRED", "QUOTATION_SENT", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"];

export function StaffWorkspace({ requests, projects }: { requests: RequestRecord[]; projects: Project[] }) {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function changeRequest(id: string, status: string) {
    setError(""); setNotice("");
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setNotice(t("statusUpdated"));
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    }
  }

  async function createQuote(event: FormEvent<HTMLFormElement>, projectId: string) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          items: [{
            description: data.description,
            quantity: Number(data.quantity),
            unitPriceMinor: Number(data.unitPriceMinor),
            discountMinor: 0
          }],
          assumptions: data.assumptions
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setNotice(t("issueQuote"));
      form.reset();
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/staff/login");
    router.refresh();
  }

  return (
    <div className="container page-shell">
      <div className="section-head">
        <div><span className="eyebrow">{t("staffRole")}</span><h1 className="page-title">{t("dashboard")}</h1><p className="muted">{t("staffScopeDescription")}</p></div>
        <button className="button ghost" onClick={logout}>{t("logout")}</button>
      </div>
      <div className="dashboard-grid">
        <div className="metric"><strong>{requests.filter((request) => request.status === "NEW").length}</strong><span>{t("newRequests")}</span></div>
        <div className="metric"><strong>{projects.length}</strong><span>{t("projectsMetric")}</span></div>
      </div>
      <ToastMessage message={error || notice} variant={error ? "error" : "success"} />
      <div className="workspace">
        <section className="panel-card">
          <h2>{t("incomingRequests")}</h2>
          {requests.length ? <div className="list">{requests.map((request) => (
            <article className="list-row" key={request.id}>
              <div><strong>{request.reference} · {request.name}</strong><p>{request.phone} · {request.email ?? t("emailMissing")} · {request.service?.name ?? t("advice")}</p><p>{request.description}</p><span className={`status ${request.status}`}>{request.status}</span></div>
              <label className="field small">{t("status")}<select className="input" aria-label={`${request.reference} ${t("status")}`} defaultValue="" onChange={(event) => event.target.value && changeRequest(request.id, event.target.value)}><option value="">{t("change")}</option>{requestStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            </article>
          ))}</div> : <div className="empty-state">{t("noRequests")}</div>}
        </section>
        <section className="panel-card">
          <h2>{t("projectQuotes")}</h2>
          {projects.length ? <div className="list">{projects.map((project) => (
            <div className="list-row" key={project.id}>
              <div><strong>{project.name}</strong><p>{project.city ?? t("cityNotProvided")} · {project.status}</p><p>{project.items.map((item) => `${item.product?.name ?? item.service?.name ?? t("unknownItem")} × ${item.quantity}`).join(", ") || t("itemsNotProvided")}</p>
                <form className="form" style={{ marginTop: 12 }} onSubmit={(event) => createQuote(event, project.id)}>
                  <div className="field"><label>{t("quoteLine")}</label><input name="description" placeholder={t("quoteItemPlaceholder")} required minLength={2} maxLength={500} /></div>
                  <div className="form-row"><div className="field"><label>{t("quantity")}</label><input name="quantity" type="number" min="1" defaultValue="1" required /></div><div className="field"><label>{t("unitPriceMinor")}</label><input name="unitPriceMinor" type="number" min="0" required /></div></div>
                  <div className="field"><label>{t("assumptions")}</label><textarea name="assumptions" maxLength={5000} /></div>
                  <button className="button secondary" disabled={busy}>{t("issueQuote")}</button>
                </form>
              </div>
            </div>
          ))}</div> : <div className="empty-state">{t("noProjects")}</div>}
        </section>
      </div>
    </div>
  );
}
