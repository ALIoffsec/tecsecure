"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";

type GiftRecipient = { id: string; name: string; email: string; active: boolean; role: string };

export function TecGiftManager({ users, actorId }: { users: GiftRecipient[]; actorId: string }) {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [recipientUserId, setRecipientUserId] = useState("");
  const [amountTec, setAmountTec] = useState("10");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const recipients = users.filter((user) => user.active);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/wallet/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientUserId, amountTec: Number(amountTec) })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setNotice(t("tecGiftSuccess").replace("{name}", result.recipientName).replace("{amount}", String(result.amountTec)));
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel-card tec-gift-manager">
      <h2>{t("tecGiftAdminTitle")}</h2>
      <p className="small muted">{t("tecGiftDescription")}</p>
      <form className="form" onSubmit={submit}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="tec-gift-recipient">{t("tecGiftRecipient")}</label>
            <select id="tec-gift-recipient" value={recipientUserId} onChange={(event) => setRecipientUserId(event.target.value)} required>
              <option value="">—</option>
              {recipients.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}{user.id === actorId ? ` (${t("you")})` : ""} · {user.email} · {user.role}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="tec-gift-amount">{t("tecGiftAmount")}</label>
            <input id="tec-gift-amount" type="number" min="1" max="100000" step="1" value={amountTec} onChange={(event) => setAmountTec(event.target.value)} required />
          </div>
        </div>
        <ToastMessage message={error} variant="error" />
        <ToastMessage message={notice} variant="success" />
        <button className="button" disabled={busy || !recipients.length} type="submit">{busy ? t("saving") : t("tecGiftSubmit")}</button>
      </form>
    </section>
  );
}
