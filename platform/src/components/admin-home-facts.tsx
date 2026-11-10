"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { emptyHomeFacts, mainServiceIds, mainServices, type HomeFacts } from "@/lib/home-facts";
import { homeCopy } from "@/lib/home-copy";

/** Staff type the real figures here; an empty field keeps that line off the site. */
export function AdminHomeFacts() {
  const { locale } = useSitePreferences();
  const c = homeCopy[locale].admin;
  const [facts, setFacts] = useState<HomeFacts | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void fetch("/api/admin/home-facts").then(response => response.ok ? response.json() : null)
      .then(data => setFacts(data?.facts ?? emptyHomeFacts)).catch(() => setFacts(emptyHomeFacts));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (name: string) => String(form.get(name) ?? "").trim();
    const body: HomeFacts = {
      trust: { projects: read("trust.projects"), years: read("trust.years"), clients: read("trust.clients"), warranty: read("trust.warranty") },
      services: Object.fromEntries(mainServiceIds.map(id => [id, { from: read(`${id}.from`), duration: read(`${id}.duration`), warranty: read(`${id}.warranty`) }])) as HomeFacts["services"]
    };
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/home-facts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? c.failed);
      setFacts(data.facts);
      setNotice(c.saved);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : c.failed);
    } finally {
      setBusy(false);
    }
  }

  const field = (name: string, label: string, value: string, placeholder: string) => <div className="field">
    <label htmlFor={`facts-${name}`}>{label}</label>
    <input id={`facts-${name}`} name={name} defaultValue={value} maxLength={40} placeholder={placeholder} />
  </div>;

  return <details className="admin-records-accordion admin-home-facts">
    <summary>{c.title}</summary>
    <ToastMessage message={error} variant="error" />
    <ToastMessage message={notice} variant="success" />
    <p className="small muted">{c.hint}</p>
    {!facts ? <p className="muted">…</p> : <form className="form" key={JSON.stringify(facts)} onSubmit={save}>
      <h3>{c.trust}</h3>
      <div className="form-row">
        {field("trust.projects", c.projects, facts.trust.projects, c.projectsExample)}
        {field("trust.years", c.years, facts.trust.years, c.yearsExample)}
      </div>
      <div className="form-row">
        {field("trust.clients", c.clients, facts.trust.clients, c.clientsExample)}
        {field("trust.warranty", c.warranty, facts.trust.warranty, c.warrantyExample)}
      </div>
      {mainServices[locale].map(service => <fieldset className="admin-home-facts-service" key={service.id}>
        <legend>{service.title}</legend>
        <div className="form-row">
          {field(`${service.id}.from`, c.from, facts.services[service.id].from, c.fromExample)}
          {field(`${service.id}.duration`, c.duration, facts.services[service.id].duration, c.durationExample)}
        </div>
        {field(`${service.id}.warranty`, c.serviceWarranty, facts.services[service.id].warranty, c.warrantyExample)}
      </fieldset>)}
      <button className="button" disabled={busy}>{busy ? c.saving : c.save}</button>
    </form>}
  </details>;
}
