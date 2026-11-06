"use client";

import Link from "next/link";
import { AppInstallButton } from "./app-install-button";
import { PrintButton } from "./print-button";
import { useSitePreferences } from "./site-preferences";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/messages";

const install: Record<Locale, { title: string; intro: string; android: string; iphone: string; desktopTitle: string; desktop: string; home: string }> = {
  uz: {
    title: "Tecsecure ilovasini o‘rnating",
    intro: "Saytni telefon yoki kompyuteringizga ilova sifatida qo‘shing: bir bosishda ochiladi va to‘liq ekranda ishlaydi.",
    android: "Yuqoridagi tugmani bosing yoki brauzer menyusidan “Ilovani o‘rnatish” bandini tanlang.",
    iphone: "Safari’da “Ulashish” tugmasini bosing va “Bosh ekranga qo‘shish”ni tanlang.",
    desktopTitle: "Kompyuter", desktop: "Chrome yoki Edge manzil satridagi o‘rnatish belgisini bosing.", home: "Bosh sahifaga qaytish"
  },
  ru: {
    title: "Установите приложение Tecsecure",
    intro: "Добавьте сайт на телефон или компьютер как приложение: он будет открываться в одно нажатие и на весь экран.",
    android: "Нажмите кнопку выше или выберите «Установить приложение» в меню браузера.",
    iphone: "В Safari нажмите «Поделиться» и выберите «На экран “Домой”».",
    desktopTitle: "Компьютер", desktop: "Нажмите значок установки в адресной строке Chrome или Edge.", home: "На главную"
  },
  en: {
    title: "Install the Tecsecure app",
    intro: "Add the site to your phone or computer as an app: it opens in one tap and runs full screen.",
    android: "Press the button above or choose “Install app” in the browser menu.",
    iphone: "In Safari, tap “Share” and choose “Add to Home Screen”.",
    desktopTitle: "Computer", desktop: "Click the install icon in the address bar of Chrome or Edge.", home: "Back to home"
  }
};

export function InstallView() {
  const { locale } = useSitePreferences();
  const c = install[locale];
  return <div className="container page-shell">
    <section className="panel-card app-install-panel" id="install-help">
      <span className="eyebrow">TECSECURE · APP</span>
      <h1>{c.title}</h1>
      <p className="muted">{c.intro}</p>
      <AppInstallButton />
      <div className="app-install-instructions">
        <div><strong>Android / Chrome</strong><p className="muted">{c.android}</p></div>
        <div><strong>iPhone / iPad</strong><p className="muted">{c.iphone}</p></div>
        <div><strong>{c.desktopTitle}</strong><p className="muted">{c.desktop}</p></div>
      </div>
      <Link className="button ghost" href="/">{c.home}</Link>
    </section>
  </div>;
}

const report: Record<Locale, { eyebrow: string; title: string; lead: string; cta: string; sections: [string, string][] }> = {
  uz: {
    eyebrow: "Namuna", title: "Audit hisoboti qanday ko‘rinadi", lead: "Bu haqiqiy mijoz hisoboti emas. Audit buyurtma qilsangiz, qo‘lingizga aynan shunday tuzilgan hujjat tegadi.", cta: "Audit narxini so‘rash",
    sections: [
      ["1. Qamrov va chegaralar", "Qaysi tarmoq, qurilma va ilovalar tekshirilgani, mijozning yozma ruxsati va tekshiruv sanalari. Ruxsat berilmagan obyektlar tekshirilmaydi."],
      ["2. Qisqa xulosa", "Rahbariyat uchun: umumiy xavf darajasi, eng muhim 3–5 topilma va birinchi navbatdagi qadamlar."],
      ["3. Topilmalar", "Har bir topilma bo‘yicha: tavsif, ta’siri, xavf darajasi (yuqori, o‘rta, past), dalil va qaysi tizimga tegishliligi."],
      ["4. Tavsiyalar", "Tuzatish rejasi: nima qilinadi, kim bajaradi, qachongacha. Ish hajmi alohida taklifda ko‘rsatiladi."],
      ["5. Qayta tekshiruv", "Tuzatishlardan keyingi tekshiruv natijasi va qolgan xavflar."],
      ["6. Kafolat va cheklovlar", "Hisobot tekshiruv vaqtidagi holatni ko‘rsatadi va to‘liq xavfsizlikni kafolatlamaydi. Kafolat shartlari har bir taklifda alohida yoziladi."]
    ]
  },
  ru: {
    eyebrow: "Образец", title: "Как выглядит отчёт об аудите", lead: "Это не отчёт реального клиента. Заказав аудит, вы получите документ именно такой структуры.", cta: "Узнать цену аудита",
    sections: [
      ["1. Охват и границы", "Какие сети, устройства и приложения проверены, письменное разрешение клиента и даты проверки. Объекты без разрешения не проверяются."],
      ["2. Краткий вывод", "Для руководства: общий уровень риска, 3–5 главных находок и первые шаги."],
      ["3. Находки", "По каждой находке: описание, влияние, уровень риска (высокий, средний, низкий), доказательство и затронутая система."],
      ["4. Рекомендации", "План устранения: что сделать, кто выполняет и к какому сроку. Объём работ указывается в отдельном предложении."],
      ["5. Повторная проверка", "Результат проверки после исправлений и оставшиеся риски."],
      ["6. Гарантии и ограничения", "Отчёт отражает состояние на момент проверки и не гарантирует полную безопасность. Условия гарантии указываются в каждом предложении."]
    ]
  },
  en: {
    eyebrow: "Sample", title: "What an audit report looks like", lead: "This is not a real client report. If you order an audit, you receive a document with exactly this structure.", cta: "Ask for an audit price",
    sections: [
      ["1. Scope and limits", "Which networks, devices and applications were tested, the client’s written permission and the test dates. Nothing without permission is tested."],
      ["2. Summary", "For management: the overall risk level, the 3–5 most important findings and the first steps."],
      ["3. Findings", "For each finding: description, impact, risk level (high, medium, low), evidence and the affected system."],
      ["4. Recommendations", "A remediation plan: what to do, who does it and by when. The amount of work is set out in a separate proposal."],
      ["5. Retest", "The result of the check after fixes, and the risks that remain."],
      ["6. Warranty and limits", "The report reflects the state at the time of testing and does not guarantee complete security. Warranty terms are written into each proposal."]
    ]
  }
};

export function SampleReportView() {
  const { locale } = useSitePreferences();
  const c = report[locale];
  return <div className="container page-shell" style={{ maxWidth: 900 }}>
    <span className="eyebrow">{c.eyebrow}</span>
    <h1 className="page-title">{c.title}</h1>
    <p className="lead">{c.lead}</p>
    <div className="dashboard-grid">
      {c.sections.map(([title, text]) => <article className="panel-card" key={title}><h2>{title}</h2><p>{text}</p></article>)}
    </div>
    <p><Link className="button" href="/request-quote">{c.cta}</Link></p>
  </div>;
}

const certificateCopy: Record<Locale, { notFound: string; notFoundHint: string; verified: string; kicker: string; line: string; score: string; issued: string; id: string; note: string }> = {
  uz: { notFound: "Sertifikat topilmadi", notFoundHint: "Kod noto‘g‘ri yoki bunday sertifikat mavjud emas.", verified: "TASDIQLANGAN", kicker: "Ushbu hujjat tasdiqlaydiki", line: "quyidagi imtihondan muvaffaqiyatli o‘tdi", score: "Natija", issued: "Berilgan sana", id: "Sertifikat raqami", note: "Sertifikat Tecsecure o‘quv dasturidagi imtihon natijasini tasdiqlaydi. U ishga joylashish yoki xalqaro sertifikat kafolati emas." },
  ru: { notFound: "Сертификат не найден", notFoundHint: "Код неверен или такого сертификата не существует.", verified: "ПОДТВЕРЖДЁН", kicker: "Настоящий документ подтверждает, что", line: "успешно сдал(а) экзамен", score: "Результат", issued: "Дата выдачи", id: "Номер сертификата", note: "Сертификат подтверждает результат экзамена в учебной программе Tecsecure. Он не гарантирует трудоустройство и не является международным сертификатом." },
  en: { notFound: "Certificate not found", notFoundHint: "The code is wrong or this certificate does not exist.", verified: "VERIFIED", kicker: "This document certifies that", line: "has successfully passed the exam", score: "Score", issued: "Date issued", id: "Certificate number", note: "This certificate confirms an exam result in the Tecsecure learning programme. It does not guarantee employment and is not an international certification." }
};

export function CertificateNotFound() {
  const { locale } = useSitePreferences();
  const c = certificateCopy[locale];
  return <div className="container page-shell practice-page"><section className="practice-lock"><h1>{c.notFound}</h1><p className="muted">{c.notFoundHint}</p></section></div>;
}

export function CertificateView({ name, title, acronym, accent, score, issuedAt, code }: { name: string; title: string; acronym: string; accent: string; score: number; issuedAt: Date; code: string }) {
  const { locale } = useSitePreferences();
  const c = certificateCopy[locale];
  return <div className="container page-shell practice-page">
    <section className="cert" style={{ "--cert-accent": accent } as React.CSSProperties}>
      <div className="cert-side" aria-hidden="true"><b>{acronym}</b><i /></div>
      <div className="cert-body">
        <header><span className="cert-brand">TECSECURE ACADEMY</span><span className="cert-status">{c.verified}</span></header>
        <p className="cert-kicker">{c.kicker}</p>
        <h1 className="cert-name">{name}</h1>
        <p className="cert-line">{c.line}</p>
        <h2 className="cert-title">{title}</h2>
        <dl className="cert-meta">
          <div><dt>{c.score}</dt><dd>{score}%</dd></div>
          <div><dt>{c.issued}</dt><dd>{formatDate(issuedAt)}</dd></div>
          <div><dt>{c.id}</dt><dd><code>{code}</code></dd></div>
        </dl>
        <p className="cert-note">{c.note}</p>
        <PrintButton />
      </div>
    </section>
  </div>;
}
