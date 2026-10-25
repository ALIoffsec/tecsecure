"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type PortalMessageCopy = {
  placeholder: string;
  submit: string;
  submitting: string;
  sent: string;
  botUnavailable: string;
  failed: string;
};

export function PortalMessageForm({ copy }: { copy: PortalMessageCopy }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const result = await response.json().catch(() => ({})) as {
        error?: string;
        telegramSent?: boolean;
      };
      if (!response.ok) {
        setError(result.error ?? copy.failed);
        return;
      }
      setMessage("");
      setNotice(result.telegramSent ? copy.sent : copy.botUnavailable);
      router.refresh();
    } catch {
      setError(copy.failed);
    } finally {
      setBusy(false);
    }
  }

  return <form className="form portal-message-form" onSubmit={submit}>
    <label htmlFor="portal-message">{copy.placeholder}</label>
    <textarea
      id="portal-message"
      required
      minLength={3}
      maxLength={3000}
      rows={3}
      value={message}
      onChange={(event) => setMessage(event.target.value)}
    />
    {error && <p className="notice error" role="alert">{error}</p>}
    {notice && <p className="notice success" role="status">{notice}</p>}
    <button className="button" type="submit" disabled={busy || message.trim().length < 3}>
      {busy ? copy.submitting : copy.submit}
    </button>
  </form>;
}
