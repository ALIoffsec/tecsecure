"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSitePreferences } from "@/components/site-preferences";

const copy = {
  uz: { title: "Nimadir noto‘g‘ri ketdi", body: "Sahifani yuklab bo‘lmadi. Ma’lumotlaringiz saqlangan. Qayta urinib ko‘ring.", retry: "Qayta urinish", home: "Bosh sahifa" },
  ru: { title: "Что-то пошло не так", body: "Не удалось загрузить страницу. Ваши данные сохранены. Попробуйте ещё раз.", retry: "Повторить", home: "На главную" },
  en: { title: "Something went wrong", body: "This page could not load. Your data is safe. Please try again.", retry: "Try again", home: "Home" }
};

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const { locale } = useSitePreferences();
  const c = copy[locale];
  useEffect(() => { console.error("Page render failed", error); }, [error]);
  return <div className="container page-shell">
    <div className="empty-state" role="alert">
      <h1 className="page-title">{c.title}</h1>
      <p>{c.body}</p>
      <div className="hero-actions"><button className="button" type="button" onClick={retry}>{c.retry}</button><Link className="button secondary" href="/">{c.home}</Link></div>
    </div>
  </div>;
}
