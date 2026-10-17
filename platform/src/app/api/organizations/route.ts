import { getCurrentUser, isResponse, requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizationSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role === "STAFF") return Response.json({ error: "Bu amal uchun ruxsat yo‘q." }, { status: 403 });
  if (user.role === "ADMIN" || user.role === "FOUNDER") {
    const authorized = await requireAdminApi();
    if (isResponse(authorized)) return authorized;
  }
  const organizations = await prisma.organization.findMany({
    where: user.role === "CUSTOMER" ? { members: { some: { userId: user.id } } } : {},
    include: { locations: true, members: { select: { userId: true, role: true } } },
    orderBy: { createdAt: "desc" }
  });
  return Response.json({ organizations });
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
  const parsed = organizationSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Tashkilot ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });

  try {
    const organization = await prisma.$transaction(async (tx) => {
      const created = await tx.organization.create({
        data: {
          name: parsed.data.name,
          type: parsed.data.type || null,
          email: parsed.data.email || null,
          phone: parsed.data.phone || null,
          billingAddress: parsed.data.billingAddress || null,
          members: { create: { userId: user.id, role: "OWNER" } },
          locations: parsed.data.location ? { create: parsed.data.location } : undefined
        },
        include: { locations: true }
      });
      await tx.auditLog.create({ data: { actorId: user.id, action: "ORGANIZATION_CREATED", entity: "Organization", entityId: created.id } });
      return created;
    });
    return Response.json({ organization }, { status: 201 });
  } catch (error) {
    console.error("Organization creation failed", error);
    return Response.json({ error: "Tashkilotni saqlab bo‘lmadi." }, { status: 500 });
  }
}
