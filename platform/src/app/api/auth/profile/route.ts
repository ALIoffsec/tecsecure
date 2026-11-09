import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/otp";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(40).transform((value) => value || null),
  currentPassword: z.string().max(128).optional()
});

export async function PATCH(request: Request) {
  const actor = await getCurrentUser();
  if (!actor) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return Response.json({ error: "Profil ma’lumotlarini tekshiring.", details: parsed.error.flatten() }, { status: 400 });
  }

  // Email and phone are what password reset and phone sign-in trust, so changing either needs the current
  // password: a stolen session alone must not be able to point the account at someone else's inbox or number.
  const { currentPassword, ...changes } = parsed.data;
  const account = await prisma.user.findUnique({ where: { id: actor.id }, select: { email: true, phone: true, passwordHash: true } });
  if (!account) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const samePhone = (account.phone ? normalizePhone(account.phone) ?? account.phone : null) === (changes.phone ? normalizePhone(changes.phone) ?? changes.phone : null);
  const sensitive = changes.email !== account.email || !samePhone;
  if (sensitive) {
    if (!(await checkRateLimit("profile-password", actor.id, 10, 15 * 60 * 1000))) {
      return Response.json({ error: "Urinishlar limiti oshdi. 15 daqiqadan so‘ng qayta urinib ko‘ring." }, { status: 429 });
    }
    if (!currentPassword || !(await bcrypt.compare(currentPassword, account.passwordHash))) {
      return Response.json({ error: "Email yoki telefonni o‘zgartirish uchun joriy parolni to‘g‘ri kiriting.", code: "PASSWORD_REQUIRED" }, { status: 403 });
    }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: actor.id },
        // A new number has not been proved yet.
        data: { ...changes, ...(!samePhone ? { phoneVerifiedAt: null } : {}) },
        select: { id: true, name: true, email: true, phone: true, role: true }
      });
      await tx.auditLog.create({
        data: { actorId: actor.id, action: sensitive ? "PROFILE_CONTACT_CHANGED" : "PROFILE_UPDATED", entity: "User", entityId: actor.id }
      });
      return user;
    });
    return Response.json({ user: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Bu email boshqa hisobda ishlatilmoqda." }, { status: 409 });
    }
    console.error("Profile update failed", error);
    return Response.json({ error: "Profilni saqlab bo‘lmadi." }, { status: 500 });
  }
}
