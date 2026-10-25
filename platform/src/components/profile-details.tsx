"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountSessionActions } from "@/components/account-session-actions";
import { PasswordChangeForm } from "@/components/password-change-form";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";

export function ProfileDetails({ user }: { user: { name: string; email: string; phone: string | null; role: string } }) {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [editing, setEditing] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setSavingProfile(true);
    setProfileError("");
    setProfileNotice("");
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setEditing(false);
      setProfileNotice(t("profileUpdated"));
      router.refresh();
    } catch (issue) {
      setProfileError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setSavingProfile(false);
    }
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm(t("deleteAccountConfirmation"))) return;

    setDeleteError("");
    setDeleting(true);
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: new FormData(form).get("deletePassword") })
      });
      if (!response.ok) {
        const message = response.status === 400
          ? t("incorrectCurrentPassword")
          : response.status === 429
            ? t("accountDeletionRateLimited")
            : t("accountDeleteFailed");
        setDeleteError(message);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setDeleteError(t("accountDeleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="panel-card profile-details-card">
      <span className="eyebrow">{t("profile")}</span>
      <h1 className="page-title">{t("accountDetails")}</h1>
      <div>
        <ToastMessage message={profileNotice} variant="success" />
        {editing ? <form className="form" onSubmit={saveProfile}>
          <div className="field"><label htmlFor="profile-name">{t("name")}</label><input id="profile-name" name="name" defaultValue={user.name} minLength={2} maxLength={100} required /></div>
          <div className="field"><label htmlFor="profile-email">{t("email")}</label><input id="profile-email" name="email" type="email" defaultValue={user.email} maxLength={254} required /></div>
          <div className="field"><label htmlFor="profile-phone">{t("phone")}</label><input id="profile-phone" name="phone" type="tel" defaultValue={user.phone ?? ""} maxLength={40} /></div>
          <ToastMessage message={profileError} variant="error" />
          <div className="hero-actions"><button className="button" type="submit" disabled={savingProfile}>{savingProfile ? t("saving") : t("save")}</button><button className="button ghost" type="button" disabled={savingProfile} onClick={() => { setEditing(false); setProfileError(""); }}>{t("cancel")}</button></div>
        </form> : <>
          <p>{t("name")}: {user.name}</p>
          <p>{t("email")}: {user.email}</p>
          <p>{t("phone")}: {user.phone || t("notProvided")}</p>
          <p>{t("role")}: {user.role}</p>
          <button className="button secondary" type="button" onClick={() => setEditing(true)}>{t("editProfile")}</button>
        </>}
        <p className="muted">{t("passwordResetNotice")}</p>
        <h2>{t("changePassword")}</h2>
        <PasswordChangeForm />
        {user.role === "CUSTOMER" && <section className="account-danger-zone">
          <h2>{t("deleteAccountTitle")}</h2>
          <p className="small muted">{t("deleteAccountNotice")}</p>
          <form className="form" onSubmit={deleteAccount}>
            <div className="field">
              <label htmlFor="deletePassword">{t("confirmDeleteAccount")}</label>
              <input id="deletePassword" name="deletePassword" type="password" autoComplete="current-password" required maxLength={128} />
            </div>
            <ToastMessage message={deleteError} variant="error" />
            <button className="button danger" type="submit" disabled={deleting}>
              {deleting ? t("deletingAccount") : t("deleteAccount")}
            </button>
          </form>
        </section>}
        <div className="account-signout"><AccountSessionActions /></div>
      </div>
    </section>
  );
}
