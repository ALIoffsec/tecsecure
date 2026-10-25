import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { PrintButton } from "@/components/print-button";
import { getLearningExam } from "@/lib/learning-content";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sertifikatni tekshirish", robots: { index: false } };

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const certificate = isPreviewMode || !/^TEC-[A-Z0-9]{6}-[A-Z0-9]{6}$/.test(code)
    ? null
    : await prisma.learningCertificate.findUnique({ where: { code }, select: { code: true, examSlug: true, scorePercent: true, issuedAt: true, user: { select: { name: true } } } });
  if (!certificate) return <div className="container page-shell practice-page"><section className="practice-lock"><h1>Sertifikat topilmadi</h1><p className="muted">Kod noto‘g‘ri yoki sertifikat mavjud emas.</p></section></div>;
  const exam = await getLearningExam(certificate.examSlug);
  const accent = exam?.accent ?? "#3aa9ff";
  return <div className="container page-shell practice-page">
    <section className="cert" style={{ "--cert-accent": accent } as CSSProperties}>
      <div className="cert-side" aria-hidden="true"><b>{exam?.acronym ?? "TEC"}</b><i /></div>
      <div className="cert-body">
        <header><span className="cert-brand">TECSECURE ACADEMY</span><span className="cert-status">TASDIQLANGAN</span></header>
        <p className="cert-kicker">Ushbu hujjat tasdiqlaydiki</p>
        <h1 className="cert-name">{certificate.user.name}</h1>
        <p className="cert-line">quyidagi imtihondan muvaffaqiyatli o‘tdi</p>
        <h2 className="cert-title">{exam?.credential ?? certificate.examSlug}</h2>
        <dl className="cert-meta">
          <div><dt>Natija</dt><dd>{certificate.scorePercent}%</dd></div>
          <div><dt>Berilgan sana</dt><dd>{certificate.issuedAt.toLocaleDateString("uz-UZ")}</dd></div>
          <div><dt>Sertifikat ID</dt><dd><code>{certificate.code}</code></dd></div>
        </dl>
        <p className="cert-note">Bu sertifikat Tecsecure o‘quv dasturi doirasidagi imtihon natijasini tasdiqlaydi. U ishga kirish yoki xalqaro sertifikatsiya kafolati emas.</p>
        <PrintButton />
      </div>
    </section>
  </div>;
}
