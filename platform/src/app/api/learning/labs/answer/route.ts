import { z } from "zod";
import { getLab, isLabAnswerCorrect } from "@/lib/learning-labs";
import { labPurchaseKey, readJson, requirePracticeUser } from "@/lib/practice-server";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({ slug: z.string().min(1).max(100), taskId: z.string().min(1).max(60), answer: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const auth = await requirePracticeUser();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return Response.json({ error: "Javobni tekshiring." }, { status: 400 });
  const lab = getLab(parsed.data.slug);
  const task = lab?.tasks.find((item) => item.id === parsed.data.taskId);
  if (!lab || !task) return Response.json({ error: "Topshiriq topilmadi." }, { status: 404 });
  const userId = auth.user.id;

  const unlocked = await prisma.learningPurchase.findUnique({
    where: { userId_purchaseKey: { userId, purchaseKey: labPurchaseKey(lab.slug) } },
    select: { id: true }
  });
  if (!unlocked) return Response.json({ error: "Avval laboratoriyani oching." }, { status: 403 });
  if (!(await checkRateLimit("lab-answer", `${userId}:${lab.slug}`, 40, 10 * 60 * 1000))) {
    return Response.json({ error: "Juda ko‘p urinish. Birozdan keyin qayta urinib ko‘ring." }, { status: 429 });
  }

  const correct = isLabAnswerCorrect(task, parsed.data.answer);
  if (!correct) return Response.json({ correct: false, solvedCount: await prisma.learningLabTask.count({ where: { userId, labSlug: lab.slug } }), completed: false });

  await prisma.learningLabTask.upsert({
    where: { userId_labSlug_taskId: { userId, labSlug: lab.slug, taskId: task.id } },
    create: { userId, labSlug: lab.slug, taskId: task.id },
    update: {}
  });
  const solvedCount = await prisma.learningLabTask.count({ where: { userId, labSlug: lab.slug } });
  const completed = solvedCount >= lab.tasks.length;
  if (completed) {
    await prisma.learningLabCompletion.upsert({
      where: { userId_labSlug: { userId, labSlug: lab.slug } },
      create: { userId, labSlug: lab.slug },
      update: {}
    });
  }
  return Response.json({ correct: true, solvedCount, completed, debrief: completed ? lab.debrief : undefined });
}
