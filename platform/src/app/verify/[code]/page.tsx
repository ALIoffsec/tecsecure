import type { Metadata } from "next";
import { PrintButton } from "@/components/print-button";
import { getExam } from "@/lib/learning-exams";
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
  const exam = getExam(certificate.examSlug);
  return <div className="container page-shell practice-page">
    <section className="certificate">
      <span className="eyebrow">Tecsecure</span>
      <h1>Kurs yakuni sertifikati</h1>
      <p className="certificate-name">{certificate.user.name}</p>
      <p>{exam?.title ?? certificate.examSlug} imtihonini {certificate.scorePercent}% natija bilan topshirdi.</p>
      <p className="muted">Berilgan sana: {certificate.issuedAt.toLocaleDateString("uz-UZ")} · Kod: <code>{certificate.code}</code></p>
      <p className="muted certificate-note">Bu sertifikat Tecsecure o‘quv dasturi doirasidagi imtihon natijasini tasdiqlaydi. U ishga kirish yoki xalqaro sertifikatsiya kafolati emas.</p>
      <PrintButton />
    </section>
  </div>;
}
