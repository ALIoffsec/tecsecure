"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { signIn } from "next-auth/react";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";

type Provider = { id: string; name: string };
type ProviderState = { providers: Provider[]; error: boolean } | null;
type OAuthLetterStyle = CSSProperties & { "--oauth-letter-index": number };

function ProviderIcon({ id }: { id: string }) {
  if (id === "google") {
    return <svg viewBox="0 0 24 24" focusable="false">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.31v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.05-3.71 1.05-2.86 0-5.28-1.93-6.15-4.53H2.16v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.85 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.16a11 11 0 0 0 0 9.86l3.69-2.84Z" />
      <path fill="#EA4335" d="M12 4.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45.99 14.97 0 12 0a11 11 0 0 0-9.84 7.07l3.69 2.84C6.72 7.31 9.14 4.38 12 4.38Z" />
    </svg>;
  }
  if (id === "github") {
    return <svg viewBox="0 0 24 24" focusable="false">
      <path fill="currentColor" d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.71 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.44.11-3 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.15-1.45 3.08-1.15 3.08-1.15.61 1.56.23 2.72.12 3 .72.79 1.15 1.8 1.15 3.03 0 4.33-2.63 5.29-5.14 5.57.4.34.76 1 .76 2.02v3.15c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z" />
    </svg>;
  }
  if (id === "yandex") {
    return <svg viewBox="0 0 24 24" focusable="false">
      <rect width="24" height="24" rx="6" fill="#FC3F1D" />
      <text x="12" y="18" fill="#fff" fontFamily="Arial, sans-serif" fontSize="17" fontWeight="700" textAnchor="middle">Я</text>
    </svg>;
  }
  return <svg viewBox="0 0 24 24" focusable="false">
    <path fill="#F25022" d="M2 2h9v9H2z" />
    <path fill="#7FBA00" d="M13 2h9v9h-9z" />
    <path fill="#00A4EF" d="M2 13h9v9H2z" />
    <path fill="#FFB900" d="M13 13h9v9h-9z" />
  </svg>;
}

export function OAuthSignIn({ mode }: { mode: "login" | "register" }) {
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
          ? "Bu email bilan avval akkaunt yaratilgan bo‘lishi mumkin. Mavjud akkauntingizga avval bog‘langan usul bilan kiring."
          : locale === "ru"
            ? "Возможно, аккаунт с этим email уже существует. Войдите в него ранее подключённым способом."
            : "An account may already exist with this email. Sign in using the method already linked to it.")
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
          ["google", "github", "yandex", "microsoft"].includes(provider.id)
        );
        setState({ providers, error: false });
      })
      .catch(() => {
        if (mounted) setState({ providers: [], error: true });
      });
    return () => { mounted = false; };
  }, [locale]);

  const text = locale === "ru"
    ? {
        heading: mode === "register" ? "Или зарегистрируйтесь через" : "Или войдите через",
        unavailable: "Вход через провайдера пока не настроен.",
        failed: "Не удалось загрузить способы входа."
      }
    : locale === "en"
      ? {
          heading: mode === "register" ? "Or register with" : "Or continue with",
          unavailable: "Social sign-in is not configured yet.",
          failed: "Could not load sign-in providers."
        }
      : {
          heading: mode === "register" ? "Yoki quyidagi hisob bilan ro‘yxatdan o‘ting" : "Yoki quyidagi hisob orqali kiring",
          unavailable: "Tashqi hisob orqali kirish hali sozlanmagan.",
          failed: "Kirish usullarini yuklab bo‘lmadi."
        };

  if (!state) return null;

  return <div className="oauth-sign-in" aria-live="polite">
    <p className="small muted">{text.heading}</p>
    {state.error
      ? <p className="small muted">{text.failed}</p>
      : state.providers.length
        ? <div className="hero-actions">
          {state.providers.map((provider) => <button
            className={`button ghost oauth-provider-button oauth-provider-${provider.id}`}
            key={provider.id}
            type="button"
            aria-label={provider.name}
            title={provider.name}
            disabled={Boolean(busy)}
            onClick={async () => {
              setBusy(provider.id);
              setProviderError("");
              try {
                const result = await signIn(provider.id, { callbackUrl: "/portal", redirect: false });
                if (result?.error) {
                  setProviderError(locale === "uz"
                    ? "Kirish amalga oshmadi. Akkauntga avval bog‘langan kirish usulidan foydalaning."
                    : locale === "ru"
                      ? "Вход не выполнен. Используйте способ входа, ранее подключённый к аккаунту."
                      : "Sign-in failed. Use the sign-in method already linked to your account.");
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
            <span className="oauth-provider-icon" aria-hidden="true">
              {busy === provider.id ? <span className="oauth-provider-spinner" /> : <ProviderIcon id={provider.id} />}
            </span>
            <span className="oauth-provider-label" aria-hidden="true">
              {Array.from(provider.name).map((letter, index) => <span
                key={`${provider.id}-${index}`}
                style={{ "--oauth-letter-index": index } as OAuthLetterStyle}
              >{letter === " " ? "\u00a0" : letter}</span>)}
            </span>
          </button>)}
        </div>
        : <p className="small muted">{text.unavailable}</p>}
    <ToastMessage message={providerError} variant="error" />
  </div>;
}
