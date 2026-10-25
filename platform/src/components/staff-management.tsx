"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import type { MessageKey } from "@/lib/messages";

type UserRole = "CUSTOMER" | "STAFF" | "ADMIN" | "FOUNDER";
type ManagedUser = { id: string; name: string; email: string; role: UserRole; active: boolean; permissions: string[] };
const permissionChoices: readonly (readonly [string, MessageKey])[] = [
  ["REQUESTS", "moduleRequests"], ["PROJECTS", "moduleProjects"], ["SERVICES", "moduleServices"],
  ["PRODUCTS", "moduleProducts"], ["NEWS", "moduleNews"], ["COMPANY", "moduleCompany"],
  ["SUBSCRIPTIONS", "moduleSubscriptions"], ["PAYMENTS", "modulePayments"],
  ["CONTENT", "moduleContent"], ["PORTFOLIO", "modulePortfolio"], ["WALLET", "moduleWallet"], ["SYSTEM", "moduleSystem"]
] as const;

export function StaffManagement({ users, founder }: { users: ManagedUser[]; founder: boolean }) {
  const { t } = useSitePreferences();
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleUserCount, setVisibleUserCount] = useState(20);
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return users.filter((user) => `${user.name} ${user.email}`.toLocaleLowerCase().includes(query));
  }, [users, search]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = { ...Object.fromEntries(formData), permissions: formData.getAll("permissions") };
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      form.reset();
      setNotice(t("staffAccountCreated"));
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function updateUser(user: ManagedUser, patch: { role?: UserRole; permissions?: string[]; active?: boolean }) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, ...patch })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setNotice(t("staffAccountUpdated"));
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(user: ManagedUser) {
    if (!window.confirm(t("confirmDeleteUser").replace("{name}", user.name))) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setNotice(t("userDeleted"));
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel-card">
      <h2>{t("staffManagementHeading")}</h2>
      <ToastMessage message={error || notice} variant={error ? "error" : "success"} />
      <details className="staff-create-panel">
        <summary>{t("addStaffAccount")}</summary>
        <form className="form staff-create-form" onSubmit={submit}>
          <div className="form-row">
            <div className="field"><label htmlFor="staff-name">{t("name")}</label><input id="staff-name" name="name" minLength={2} maxLength={100} required /></div>
            <div className="field"><label htmlFor="staff-email">{t("email")}</label><input id="staff-email" name="email" type="email" maxLength={254} required /></div>
          </div>
          <div className="form-row">
            <div className="field"><label htmlFor="staff-password">{t("password")}</label><input id="staff-password" name="password" type="password" minLength={8} maxLength={128} required /></div>
            <div className="field"><label htmlFor="staff-role">{t("userRole")}</label><select id="staff-role" name="role"><option value="STAFF">{t("staffRole")}</option>{founder && <option value="ADMIN">{t("adminRole")}</option>}</select></div>
          </div>
          <fieldset className="permission-fieldset">
            <legend>{t("staffPermissions")}</legend>
            <div className="permission-grid">{permissionChoices.map(([value, label]) => <label className="permission-option" key={value}><input type="checkbox" name="permissions" value={value} />{t(label)}</label>)}</div>
          </fieldset>
          <button className="button" type="submit" disabled={busy}>{t("addStaffAccount")}</button>
        </form>
      </details>
      <div className="dashboard-grid account-counts">
        <div className="metric"><strong>{users.length}</strong><span>{t("accounts")}</span></div>
        <div className="metric"><strong>{users.filter((user) => user.role === "CUSTOMER").length}</strong><span>{t("customerRole")}</span></div>
        <div className="metric"><strong>{users.filter((user) => user.role === "STAFF").length}</strong><span>{t("staffRole")}</span></div>
        <div className="metric"><strong>{users.filter((user) => user.role === "ADMIN" || user.role === "FOUNDER").length}</strong><span>{t("adminRole")}</span></div>
      </div>
      <div className="field user-search"><label htmlFor="user-search">{t("searchUsers")}</label><input id="user-search" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setVisibleUserCount(20); }} placeholder={t("searchUserPlaceholder")} /></div>
      <p className="staff-list-count">{filteredUsers.length ? `${Math.min(visibleUserCount, filteredUsers.length)} / ${filteredUsers.length}` : "0"} · {t("accounts")}</p>
      <div className="staff-user-list">
        {filteredUsers.slice(0, visibleUserCount).map((user) => (
          <details className="staff-user-item" key={user.id}>
            <summary className="staff-user-summary">
              <span><strong>{user.name}</strong><small>{user.email}</small></span>
              <span className="staff-user-badges">
                <span className="status">{user.role === "FOUNDER" ? t("founderRole") : user.role === "ADMIN" ? t("adminRole") : user.role === "STAFF" ? t("staffRole") : t("customerRole")}</span>
                <span className={`status ${user.active ? "active" : "archived"}`}>{user.active ? t("accountActive") : t("accountDisabled")}</span>
              </span>
            </summary>
            <div className="staff-user-details">
              {user.role !== "FOUNDER" && (founder || user.role !== "ADMIN") && <div className="hero-actions">
                <select aria-label={`${user.name} ${t("userRole")}`} value={user.role} disabled={busy} onChange={(event) => updateUser(user, { role: event.target.value as UserRole })}>
                  <option value="CUSTOMER">{t("customerRole")}</option><option value="STAFF">{t("staffRole")}</option>{founder && <option value="ADMIN">{t("adminRole")}</option>}
                </select>
                <button className="button secondary small" type="button" disabled={busy} onClick={() => updateUser(user, { active: !user.active })}>{user.active ? t("disableAccount") : t("enableAccount")}</button>
                <button className="button danger small" type="button" disabled={busy} onClick={() => void deleteUser(user)}>{t("deleteUser")}</button>
              </div>}
              {user.role === "STAFF" && <details className="staff-permissions"><summary>{t("staffPermissions")}</summary><div className="permission-grid">{permissionChoices.map(([value, label]) => <label className="permission-option" key={value}><input type="checkbox" checked={user.permissions.includes(value)} disabled={busy} onChange={(event) => updateUser(user, { permissions: event.target.checked ? [...user.permissions, value] : user.permissions.filter((permission) => permission !== value) })} />{t(label)}</label>)}</div></details>}
            </div>
          </details>
        ))}
      </div>
      {filteredUsers.length > visibleUserCount && <button className="button secondary staff-show-more" type="button" onClick={() => setVisibleUserCount((count) => count + 20)}>{t("showMoreUsers")} · {filteredUsers.length - visibleUserCount}</button>}
      {!filteredUsers.length && <p className="muted">{t("noUserMatches")}</p>}
    </section>
  );
}
