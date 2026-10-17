import { endAdminAccess } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    await endAdminAccess();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Admin access lock failed", error);
    return Response.json({ error: "Admin kirishini qulflab bo‘lmadi." }, { status: 500 });
  }
}
