"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const labels = {
  uz: { install: "Ilovani yuklab olish", installed: "Ilova o‘rnatilgan" },
  ru: { install: "Установить приложение", installed: "Приложение установлено" },
  en: { install: "Install app", installed: "App installed" }
};

export function AppInstallButton() {
  const pathname = usePathname();
  const { locale } = useSitePreferences();
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!prompt) return;
    event.preventDefault();
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  const label = installed ? labels[locale].installed : labels[locale].install;
  return (
    <Link
      className="app-install-button"
      href={pathname === "/install" ? "#install-help" : "/install"}
      onClick={install}
      aria-label={label}
      title={label}
      aria-disabled={installed}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" /></svg>
      <span>{label}</span>
    </Link>
  );
}
