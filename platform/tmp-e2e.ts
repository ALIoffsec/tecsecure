import { PrismaClient } from "@prisma/client";
import { learningLabs } from "./src/lib/learning-labs";
import { getExam } from "./src/lib/learning-exams";

const base = "http://127.0.0.1:3000";
const prisma = new PrismaClient();

async function main() {
  const email = "student@tecsecure.test";
  const user = await prisma.user.update({ where: { email }, data: { rewardPoints: 1000 } });
  await prisma.learningModuleCompletion.upsert({ where: { userId_moduleSlug: { userId: user.id, moduleSlug: "network-fundamentals" } }, create: { userId: user.id, moduleSlug: "network-fundamentals", rewardTec: 0 }, update: {} });
  const login = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password: "Student#2026Local" }) });
  const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  console.log("login", login.status);
  const call = async (path: string, body: object) => {
    const r = await fetch(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify(body) });
    return { status: r.status, data: await r.json().catch(() => ({})) } as { status: number; data: Record<string, unknown> };
  };
  const exam = getExam("tec-network-foundations")!;
  console.log("exam before lab", (await call("/api/learning/exams/start", { slug: exam.slug })).status);
  const lab = learningLabs.find((l) => l.slug === "subnet-vlsm-office")!;
  console.log("answer locked", (await call("/api/learning/labs/answer", { slug: lab.slug, taskId: lab.tasks[0].id, answer: lab.tasks[0].answers[0] })).status);
  console.log("unlock", await call("/api/learning/labs/unlock", { slug: lab.slug }));
  console.log("unlock again", await call("/api/learning/labs/unlock", { slug: lab.slug }));
  console.log("wrong", (await call("/api/learning/labs/answer", { slug: lab.slug, taskId: lab.tasks[0].id, answer: "zzz" })).data);
  let last: Record<string, unknown> = {};
  for (const task of lab.tasks) last = (await call("/api/learning/labs/answer", { slug: lab.slug, taskId: task.id, answer: task.answers[0] })).data;
  console.log("last", last.correct, last.completed, last.solvedCount);
  const start = await call("/api/learning/exams/start", { slug: exam.slug });
  console.log("start", start.status, start.data.charged, start.data.tecBalance, (start.data.questions as unknown[])?.length);
  const resume = await call("/api/learning/exams/start", { slug: exam.slug });
  console.log("resume", resume.data.resumed, resume.data.charged);
  const answers = Object.fromEntries(exam.questions.map((q) => [q.id, q.correct]));
  const submit = await call("/api/learning/exams/submit", { attemptId: start.data.attemptId, answers });
  console.log("submit", submit.status, submit.data.scorePercent, submit.data.passed, submit.data.certificateCode);
  console.log("resubmit", (await call("/api/learning/exams/submit", { attemptId: start.data.attemptId, answers })).status);
  const page = await fetch(`${base}/verify/${submit.data.certificateCode}`);
  console.log("verify page", page.status, (await page.text()).includes("Kurs yakuni sertifikati"));
  for (const path of ["/learning/practice", `/learning/labs/${lab.slug}`, `/learning/exams/${exam.slug}`]) {
    console.log(path, (await fetch(`${base}${path}`, { headers: { cookie } })).status);
  }
}
main().finally(() => prisma.$disconnect());
