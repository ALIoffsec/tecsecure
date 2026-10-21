"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useSitePreferences } from "@/components/site-preferences";

type Provider = { id: string; name: string };
type ProviderState = { providers: Provider[]; error: boolean } | null;

export function OAuthSignIn() {
  const { locale } = useSitePreferences();
  const [state, setState] = useState<ProviderState>(null);
  const [busy, setBusy] = useState("");
  const [providerError, setProviderError] = useState("");

  useEffect(() => {
    let mounted = true;
    const query = new URLSearchParams(window.location.search);
    const authError = query.get("error");
    if (authError && mounted) {
      setProviderError(authError === "OAuthCallbackError"
        ? (locale === "uz"
          ? "Bu email bilan avval akkaunt yaratilgan bo‘lishi mumkin. Mavjud akkauntga parol bilan kiring."
          : locale === "ru"
            ? "Возможно, аккаунт с этим email уже существует. Войдите в него по паролю."
            : "An account may already exist with this email. Sign in to the existing account with its password.")
        : (locale === "uz" ? "Tashqi hisob orqali kirish yakunlanmadi." : locale === "ru" ? "Не удалось завершить вход через провайдера." : "Provider sign-in could not be completed."));
    }
    fetch("/api/auth/providers")
      .then(async (response) => {
        if (!response.ok) throw new Error("OAuth provider discovery failed.");
        return response.json() as Promise<Record<string, Provider> | null>;
      })
      .then((available) => {
        if (!mounted) return;
        const providers = Object.values(available ?? {}).filter((provider) =>
          ["google", "yandex", "microsoft"].includes(provider.id)
        );
        setState({ providers, error: false });
      })
      .catch(() => {
        if (mounted) setState({ providers: [], error: true });
      });
    return () => { mounted = false; };
  }, [locale]);

  const text = locale === "ru"
    ? { heading: "Или войдите через", unavailable: "Вход через провайдера пока не настроен.", failed: "Не удалось загрузить способы входа." }
    : locale === "en"
      ? { heading: "Or continue with", unavailable: "Social sign-in is not configured yet.", failed: "Could not load sign-in providers." }
      : { heading: "Yoki quyidagi hisob orqali kiring", unavailable: "Tashqi hisob orqali kirish hali sozlanmagan.", failed: "Kirish usullarini yuklab bo‘lmadi." };

  if (!state) return null;

  return <div className="oauth-sign-in" aria-live="polite">
    <p className="small muted">{text.heading}</p>
    {state.error
      ? <p className="small muted">{text.failed}</p>
      : state.providers.length
        ? <div className="hero-actions">
          {state.providers.map((provider) => <button
            className="button ghost"
            key={provider.id}
            type="button"
            disabled={Boolean(busy)}
            onClick={async () => {
              setBusy(provider.id);
              setProviderError("");
              try {
                const result = await signIn(provider.id, { callbackUrl: "/portal", redirect: false });
                if (result?.error) {
                  setProviderError(locale === "uz" ? "Kirish amalga oshmadi. Mavjud akkauntga parol bilan kirib ko‘ring." : locale === "ru" ? "Вход не выполнен. Попробуйте войти в существующий аккаунт по паролю." : "Sign-in failed. Try signing in to your existing account with its password.");
                } else if (result?.url) {
                  window.location.assign(result.url);
                }
              } catch {
                setProviderError(text.failed);
              } finally {
                setBusy("");
              }
            }}
          >
            {busy === provider.id ? "…" : provider.name}
          </button>)}
        </div>
        : <p className="small muted">{text.unavailable}</p>}
    {providerError && <p className="small notice error" role="alert">{providerError}</p>}
  </div>;
}
