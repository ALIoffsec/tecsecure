import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const actor = await requireModuleApi("SYSTEM");
  if (isResponse(actor)) return actor;
  let database: "ok" | "unavailable" = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    database = "unavailable";
    console.error("Admin system status database check failed", error);
  }
  const memory = process.memoryUsage();
  const status = database === "ok" ? "ok" : "degraded";
  return Response.json({
    status,
    database,
    checkedAt: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memory: { rssBytes: memory.rss, heapUsedBytes: memory.heapUsed }
  }, { status: database === "ok" ? 200 : 503 });
}
