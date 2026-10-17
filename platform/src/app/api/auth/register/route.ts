import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await checkRateLimit("register-ip", ip, 8, 60 * 60 * 1000))) {
    return Response.json({ error: "Urinishlar limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return Response.json({ error: "Ism, email yoki parol talablarga mos emas.", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
      select: { id: true, name: true, email: true, role: true }
    });
    await createSession(user.id);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Bu email allaqachon ro‘yxatdan o‘tgan." }, { status: 409 });
    }
    console.error("Customer registration failed", error);
    return Response.json({ error: "Ro‘yxatdan o‘tishda xatolik yuz berdi." }, { status: 500 });
  }
}
