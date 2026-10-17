import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { destroySession, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({ password: z.string().min(1).max(128) });

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") {
    return Response.json({ error: "Xodim akkauntlarini o‘z-o‘ziga xizmat orqali o‘chirib bo‘lmaydi." }, { status: 403 });
  }
  if (!(await checkRateLimit("account-delete", user.id, 5, 60 * 60 * 1000))) {
    return Response.json({ error: "Urinishlar limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Joriy parol talab qilinadi." }, { status: 400 });

  try {
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true }
    });
    if (!account || !(await bcrypt.compare(parsed.data.password, account.passwordHash))) {
      return Response.json({ error: "Joriy parol noto‘g‘ri." }, { status: 400 });
    }
    await prisma.$transaction(async (tx) => {
      await tx.serviceRequest.updateMany({
        where: { customerId: user.id },
        data: {
          customerId: null,
          name: "Deleted account",
          phone: "",
          email: null,
          organizationName: null,
          city: null,
          location: null,
          description: "[Request details removed after account deletion]",
          budgetRange: null,
          preferredContactTime: null
        }
      });
      await tx.project.updateMany({
        where: { customerId: user.id },
        data: { customerId: null, name: "Archived customer project", notes: null, city: null }
      });
      await tx.organizationMember.deleteMany({ where: { userId: user.id } });
      await tx.notification.deleteMany({ where: { userId: user.id } });
      await tx.auditLog.updateMany({ where: { actorId: user.id }, data: { actorId: null } });
      await tx.requestStatusHistory.updateMany({ where: { actorId: user.id }, data: { actorId: null } });
      await tx.subscriptionEvent.updateMany({ where: { actorId: user.id }, data: { actorId: null } });
      await tx.payment.updateMany({ where: { submittedById: user.id }, data: { submittedById: null } });
      await tx.payment.updateMany({ where: { verifiedById: user.id }, data: { verifiedById: null } });
      await tx.user.delete({ where: { id: user.id } });
    });
    await destroySession();
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      console.error("Account deletion encountered an unhandled relational reference", { userId: user.id });
      return Response.json({ error: "Akkauntni xavfsiz o‘chirib bo‘lmadi. Yordam xizmatiga murojaat qiling." }, { status: 409 });
    }
    console.error("Account deletion failed", error);
    return Response.json({ error: "Akkauntni o‘chirib bo‘lmadi." }, { status: 500 });
  }
}
