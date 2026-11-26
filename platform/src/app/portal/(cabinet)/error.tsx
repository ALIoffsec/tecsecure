"use client";

import { useEffect } from "react";
import { useOptionalSitePreferences } from "@/components/site-preferences";

const copy = {
  uz: { title: "Bu bo‘limni yuklab bo‘lmadi", body: "Ma’lumotlaringiz saqlangan. Qayta urinib ko‘ring yoki menyudan boshqa bo‘limni oching.", retry: "Qayta urinish" },
  ru: { title: "Не удалось загрузить раздел", body: "Ваши данные сохранены. Попробуйте ещё раз или откройте другой раздел в меню.", retry: "Повторить" },
  en: { title: "This section could not load", body: "Your data is safe. Try again or open another section from the menu.", retry: "Try again" }
};

/** A failed cabinet page keeps the frame and the menu; only the page area shows the error. */
export default function CabinetError({ error, retry }: { error: unknown; retry: () => void }) {
  const locale = useOptionalSitePreferences()?.locale ?? "uz";
  const c = copy[locale];
  useEffect(() => { console.error("Cabinet page failed", error); }, [error]);
  return <section className="panel-card" role="alert">
    <h1 className="cab-title">{c.title}</h1>
    <p>{c.body}</p>
    <button className="button" type="button" onClick={retry}>{c.retry}</button>
  </section>;
}
