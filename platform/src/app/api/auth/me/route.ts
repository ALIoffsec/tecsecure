import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskPhone } from "@/lib/phone";

export const runtime = "nodejs";

/** Who is signed in. The phone leaves the server masked only (for the account menu). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { phone: true } });
  return Response.json({ user, maskedPhone: maskPhone(account?.phone) }, { headers: { "Cache-Control": "no-store" } });
}
