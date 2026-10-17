import bcrypt from "bcryptjs";
import { getCurrentUser, createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const runtime = "nodejs";
const schema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(12).max(128)
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (!(await checkRateLimit("password-change", user.id, 5, 60 * 60 * 1000))) {
    return Response.json({ error: "Urinishlar limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  }
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Parol talablarga mos emas." }, { status: 400 });

  try {
    const account = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
    if (!account || !(await bcrypt.compare(parsed.data.currentPassword, account.passwordHash))) {
      return Response.json({ error: "Joriy parol noto‘g‘ri." }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.auditLog.create({ data: { actorId: user.id, action: "PASSWORD_CHANGED", entity: "User", entityId: user.id } })
    ]);
    await createSession(user.id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Password change failed", error);
    return Response.json({ error: "Parolni yangilab bo‘lmadi." }, { status: 500 });
  }
}
