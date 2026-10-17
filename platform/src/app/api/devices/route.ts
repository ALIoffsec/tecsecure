import { getCurrentUser, isResponse, requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deviceSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role === "STAFF") return Response.json({ error: "Bu amal uchun ruxsat yo‘q." }, { status: 403 });
  if (user.role === "ADMIN" || user.role === "FOUNDER") {
    const authorized = await requireAdminApi();
    if (isResponse(authorized)) return authorized;
  }
  const devices = await prisma.device.findMany({
    where: user.role === "CUSTOMER" ? { organization: { members: { some: { userId: user.id } } } } : {},
    include: { location: { select: { name: true } }, checks: { orderBy: { checkedAt: "desc" }, take: 10 } },
    orderBy: { createdAt: "desc" }
  });
  return Response.json({ devices });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role === "STAFF") return Response.json({ error: "Bu amal uchun ruxsat yo‘q." }, { status: 403 });
  if (user.role === "ADMIN" || user.role === "FOUNDER") {
    const authorized = await requireAdminApi();
    if (isResponse(authorized)) return authorized;
  }
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = deviceSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Qurilma ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });

  const membership = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: parsed.data.organizationId } },
    select: { role: true }
  });
  if (user.role === "CUSTOMER" && (!membership || !["OWNER", "ADMINISTRATOR", "IT_MANAGER"].includes(membership.role))) {
    return Response.json({ error: "Tashkilot qurilmalarini ro‘yxatga olishga ruxsat yo‘q." }, { status: 403 });
  }
  if (parsed.data.locationId) {
    const location = await prisma.location.findFirst({
      where: { id: parsed.data.locationId, organizationId: parsed.data.organizationId },
      select: { id: true }
    });
    if (!location) return Response.json({ error: "Manzil ushbu tashkilotga tegishli emas." }, { status: 400 });
  }
  try {
    const device = await prisma.$transaction(async (tx) => {
      const created = await tx.device.create({
        data: {
          ...parsed.data,
          installedAt: parsed.data.installedAt ? new Date(parsed.data.installedAt) : null,
          warrantyEndsAt: parsed.data.warrantyEndsAt ? new Date(parsed.data.warrantyEndsAt) : null,
          monitored: false,
          status: "UNKNOWN"
        }
      });
      await tx.auditLog.create({
        data: { actorId: user.id, action: "DEVICE_REGISTERED", entity: "Device", entityId: created.id }
      });
      return created;
    });
    return Response.json({ device }, { status: 201 });
  } catch (error) {
    console.error("Device registration failed", error);
    return Response.json({ error: "Qurilmani saqlab bo‘lmadi." }, { status: 500 });
  }
}
