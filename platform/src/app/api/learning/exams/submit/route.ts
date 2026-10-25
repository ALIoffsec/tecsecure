import { randomBytes } from "node:crypto";
import { z } from "zod";
import { gradeExam } from "@/lib/learning-exams";
import { getLearningExam } from "@/lib/learning-content";
import { readJson, requirePracticeUser } from "@/lib/practice-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  attemptId: z.string().min(1).max(60),
  answers: z.record(z.string().max(10), z.number().int().min(0).max(3))
});

const GRACE_MS = 60_000;

function certificateCode() {
  const raw = randomBytes(6).toString("hex").toUpperCase();
  return `TEC-${raw.slice(0, 6)}-${raw.slice(6)}`;
}

export async function POST(request: Request) {
  const auth = await requirePracticeUser();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return Response.json({ error: "Javoblarni tekshiring." }, { status: 400 });
  const userId = auth.user.id;

  const attempt = await prisma.learningExamAttempt.findFirst({ where: { id: parsed.data.attemptId, userId } });
  const exam = attempt ? await getLearningExam(attempt.examSlug) : undefined;
  if (!attempt || !exam) return Response.json({ error: "Urinish topilmadi." }, { status: 404 });
  if (attempt.submittedAt) return Response.json({ error: "Bu urinish allaqachon topshirilgan." }, { status: 409 });

  const now = new Date();
  const expired = now.getTime() > attempt.deadlineAt.getTime() + GRACE_MS;
  const grade = expired ? gradeExam(exam, {}) : gradeExam(exam, parsed.data.answers);
  const claimed = await prisma.learningExamAttempt.updateMany({
    where: { id: attempt.id, submittedAt: null },
    data: { submittedAt: now, scorePercent: grade.scorePercent, passed: grade.passed }
  });
  if (claimed.count !== 1) return Response.json({ error: "Bu urinish allaqachon topshirilgan." }, { status: 409 });

  let certificateCodeValue: string | null = null;
  if (grade.passed) {
    const existing = await prisma.learningCertificate.findUnique({ where: { userId_examSlug: { userId, examSlug: exam.slug } } });
    if (existing) {
      certificateCodeValue = existing.code;
      if (grade.scorePercent > existing.scorePercent) {
        await prisma.learningCertificate.update({ where: { id: existing.id }, data: { scorePercent: grade.scorePercent } });
      }
    } else {
      const created = await prisma.learningCertificate.create({
        data: { code: certificateCode(), userId, examSlug: exam.slug, scorePercent: grade.scorePercent }
      });
      certificateCodeValue = created.code;
    }
  }

  const review = exam.questions
    .filter((question) => expired || parsed.data.answers[question.id] !== question.correct)
    .map((question) => ({ id: question.id, text: question.text, correctOption: question.options[question.correct], explanation: question.explanation }));
  return Response.json({
    expired,
    scorePercent: grade.scorePercent,
    correctCount: grade.correctCount,
    total: exam.questions.length,
    passed: grade.passed,
    passPercent: exam.passPercent,
    certificateCode: certificateCodeValue,
    review
  });
}
