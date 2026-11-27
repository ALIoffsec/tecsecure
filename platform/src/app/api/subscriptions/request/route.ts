import { z } from "zod";
import { afterMessage } from "@/lib/conversations";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, tooManyAttempts } from "@/lib/rate-limit";
import { escapeTelegramHtml, notifyTelegramAdmins } from "@/lib/telegram";

export const runtime = "nodejs";

const bodySchema = z.object({ organizationId: z.string().cuid(), planId: z.string().cuid().optional(), message: z.string().trim().max(1000).optional() });

/** "Obuna so‘rash": the customer asks staff for monitoring; one conversation per organisation, staff reply there. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Tashkilotni tanlang." }, { status: 400 });
  const membership = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: parsed.data.organizationId } },
    select: { organization: { select: { name: true } } }
  });
  if (!membership) return Response.json({ error: "Tashkilot topilmadi." }, { status: 404 });
  const limit = await rateLimit("subscription-request", user.id, 5, 60 * 60 * 1000);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSeconds);
  const plan = parsed.data.planId ? await prisma.subscriptionPlan.findFirst({ where: { id: parsed.data.planId, active: true }, select: { name: true } }) : null;
  const body = [`Monitoring obunasi so‘raldi${plan ? `: ${plan.name}` : ""}.`, parsed.data.message].filter(Boolean).join("\n");
  const sourceId = parsed.data.organizationId;
  const reference = `SUB-${sourceId.slice(-8).toUpperCase()}`;
  const write = () => prisma.portalConversation.upsert({
    where: { sourceType_sourceId: { sourceType: "SUBSCRIPTION_REQUEST", sourceId } },
    create: { reference, category: "SUBSCRIPTION", sourceType: "SUBSCRIPTION_REQUEST", sourceId, subject: `Obuna: ${membership.organization.name}`, customerName: user.name, customerId: user.id, messages: { create: { sender: "CUSTOMER", body } } },
    update: { ...afterMessage("CUSTOMER"), messages: { create: { sender: "CUSTOMER", body } } },
    select: { reference: true }
  });
  let conversation: { reference: string };
  try { conversation = await write(); } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
    conversation = await write();
  }
  await notifyTelegramAdmins(`<b>📡 Monitoring obunasi so‘raldi</b>\nTashkilot: ${escapeTelegramHtml(membership.organization.name)} · ${escapeTelegramHtml(user.name)}\n${escapeTelegramHtml(body)}\n\nJavob: <code>/reply ${escapeTelegramHtml(conversation.reference)} matn</code>`, conversation.reference);
  return Response.json({ ok: true }, { status: 201 });
}
