import { isResponse, requireModuleApi } from "@/lib/auth";
import { HOME_FACTS_KEY, homeFactsSchema, parseHomeFacts } from "@/lib/home-facts";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** The figures on the home and services pages. Staff type them; an empty field hides that line on the site. */
export async function GET() {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  const record = await prisma.siteSetting.findUnique({ where: { key: HOME_FACTS_KEY }, select: { value: true } });
  return Response.json({ facts: parseHomeFacts(record?.value) });
}

export async function PUT(request: Request) {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  const body = await request.json().catch(() => null);
  const parsed = homeFactsSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Qiymatlar noto‘g‘ri: har biri 40 belgidan oshmasin." }, { status: 400 });
  const value = JSON.stringify(parsed.data);
  await prisma.$transaction([
    prisma.siteSetting.upsert({ where: { key: HOME_FACTS_KEY }, create: { key: HOME_FACTS_KEY, value }, update: { value } }),
    prisma.auditLog.create({ data: { actorId: actor.id, action: "HOME_FACTS_UPDATED", entity: "SiteSetting" } })
  ]);
  return Response.json({ facts: parsed.data });
}
