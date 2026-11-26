import { Prisma } from "@prisma/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/otp";
import { endOtherSessions, getCurrentUser } from "@/lib/auth";
import { notifySecurityChange, requireReauth } from "@/lib/reauth";
import { prisma } from "@/lib/prisma";
import { isReservedEmail, reservedEmailMessage } from "@/lib/validation";
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
  // Only a newly typed address is checked, so phone and Telegram accounts can still save their name.
  if (changes.email !== account.email && isReservedEmail(changes.email)) {
    return Response.json({ error: reservedEmailMessage, code: "RESERVED_EMAIL" }, { status: 400 });
  }
  // Likewise only a new number is checked and stored in the one spelling; an old or foreign one stays as it was.
  const phone = samePhone ? account.phone : changes.phone ? normalizePhone(changes.phone) : null;
  if (!samePhone && changes.phone && !phone) {
    return Response.json({ error: "Telefon raqamini +998 XX XXX XX XX ko‘rinishida kiriting.", code: "BAD_PHONE" }, { status: 400 });
  }
  if (sensitive) {
    if (!(await checkRateLimit("profile-password", actor.id, 10, 15 * 60 * 1000))) {
      return Response.json({ error: "Urinishlar limiti oshdi. 15 daqiqadan so‘ng qayta urinib ko‘ring." }, { status: 429 });
    }
    // The confirmation window, or (without two-factor) the current password typed in the form as before.
    const confirmed = await requireReauth(actor, changes.email !== account.email ? "EMAIL" : "PHONE", currentPassword);
    if (confirmed instanceof Response) return confirmed;
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: actor.id },
        // A new number has not been proved yet.
        data: { ...changes, phone, ...(!samePhone ? { phoneVerifiedAt: null } : {}) },
        select: { id: true, name: true, email: true, phone: true, phoneVerifiedAt: true, role: true }
      });
      await tx.auditLog.create({
        data: { actorId: actor.id, action: sensitive ? "PROFILE_CONTACT_CHANGED" : "PROFILE_UPDATED", entity: "User", entityId: actor.id }
      });
      return user;
    });
    if (sensitive) {
      await endOtherSessions(actor.id);
      await notifySecurityChange(actor.id, changes.email !== account.email ? "Hisobingiz emaili o‘zgartirildi." : "Hisobingiz telefon raqami o‘zgartirildi.", changes.email !== account.email ? account.email : null);
    }
    return Response.json({ user: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Bu email boshqa hisobda ishlatilmoqda." }, { status: 409 });
    }
    console.error("Profile update failed", error);
    return Response.json({ error: "Profilni saqlab bo‘lmadi." }, { status: 500 });
  }
}
