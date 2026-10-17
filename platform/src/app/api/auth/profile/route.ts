import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(40).transform((value) => value || null)
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

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: actor.id },
        data: parsed.data,
        select: { id: true, name: true, email: true, phone: true, role: true }
      });
      await tx.auditLog.create({
        data: { actorId: actor.id, action: "PROFILE_UPDATED", entity: "User", entityId: actor.id }
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
