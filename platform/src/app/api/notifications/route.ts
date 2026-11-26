import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { CUSTOMER_EVENTS, notificationView } from "@/lib/notifications";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "private, no-store" };
const PAGE = 20;

/**
 * Without parameters, or with ?event=TEC_GIFT: the gift list exactly as before (the gift cards read it).
 * ?scope=all&cursor=<id>: the customer's news, 20 at a time. ?scope=count: how many are unread.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ notifications: [] });
  if (isPreviewMode) return Response.json({ notifications: [] });
  const query = new URL(request.url).searchParams;
  const scope = query.get("scope");
  const own = { userId: user.id, channel: "IN_APP", event: { in: [...CUSTOMER_EVENTS] } };

  if (scope === "count") {
    const unread = await prisma.notification.count({ where: { ...own, status: "UNREAD" } });
    return Response.json({ unread }, { headers: noStore });
  }
  if (scope === "all") {
    const cursor = query.get("cursor");
    const rows = await prisma.notification.findMany({
      where: own,
      select: { id: true, event: true, status: true, payload: true, createdAt: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PAGE + 1,
      ...(cursor && /^c[a-z0-9]{20,40}$/.test(cursor) ? { cursor: { id: cursor }, skip: 1 } : {})
    });
    const page = rows.slice(0, PAGE);
    const [unread] = await Promise.all([prisma.notification.count({ where: { ...own, status: "UNREAD" } })]);
    return Response.json({
      items: page.map(notificationView).filter(Boolean),
      nextCursor: rows.length > PAGE ? page[page.length - 1].id : null,
      unread
    }, { headers: noStore });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id, channel: "IN_APP", event: "TEC_GIFT" },
    select: { id: true, status: true, payload: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20
  });
  return Response.json({ notifications }, { headers: noStore });
}

const markAllSchema = z.object({ before: z.string().datetime() });

/** "Mark all as read": only the customer's own unread news up to the moment the list was loaded. */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const parsed = markAllSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "So‘rov noto‘g‘ri." }, { status: 400 });
  const updated = await prisma.notification.updateMany({
    where: { userId: user.id, channel: "IN_APP", event: { in: [...CUSTOMER_EVENTS] }, status: "UNREAD", createdAt: { lte: new Date(parsed.data.before) } },
    data: { status: "READ" }
  });
  return Response.json({ ok: true, read: updated.count });
}
