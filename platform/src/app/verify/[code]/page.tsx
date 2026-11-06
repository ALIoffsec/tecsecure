import { CertificateNotFound, CertificateView } from "@/components/static-pages";
import type { Metadata } from "next";
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
  if (!certificate) return <CertificateNotFound />;
  const exam = await getLearningExam(certificate.examSlug);
  const accent = exam?.accent ?? "#3aa9ff";
  return <CertificateView name={certificate.user.name} title={exam?.credential ?? certificate.examSlug} acronym={exam?.acronym ?? "TEC"} accent={accent} score={certificate.scorePercent} issuedAt={certificate.issuedAt} code={certificate.code} />;
}
