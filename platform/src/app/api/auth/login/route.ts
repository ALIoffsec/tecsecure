import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";
const dummyPasswordHash = bcrypt.hash("not-a-valid-user-password", 12);

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return Response.json({ error: "Email yoki parol noto‘g‘ri." }, { status: 400 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const identity = createHash("sha256").update(`${parsed.data.email}:${ip}`).digest("hex");
  if (!(await checkRateLimit("login", identity, 10, 15 * 60 * 1000))) {
    return Response.json({ error: "Kirish urinishlari limiti oshdi. 15 daqiqadan so‘ng qayta urinib ko‘ring." }, { status: 429 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    const passwordHash = user?.passwordHash ?? await dummyPasswordHash;
    const passwordMatches = await bcrypt.compare(parsed.data.password, passwordHash);
    const valid = Boolean(user?.active && passwordMatches);
    if (!valid || !user) {
      return Response.json({ error: "Email yoki parol noto‘g‘ri." }, { status: 401 });
    }
    const staffRole = user.role === "ADMIN" || user.role === "STAFF" || user.role === "FOUNDER";
    if ((parsed.data.audience === "staff" && !staffRole) || (parsed.data.audience === "customer" && staffRole)) {
      return Response.json({ error: "Bu kirish turi uchun ruxsat yo‘q." }, { status: 403 });
    }
    await createSession(user.id, staffRole);
    return Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login failed", error);
    return Response.json({ error: "Kirish vaqtida xatolik yuz berdi." }, { status: 500 });
  }
}
