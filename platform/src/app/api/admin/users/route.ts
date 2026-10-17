import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { isResponse, requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminModules, AdminModule } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";

const createSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128),
  role: z.enum(["STAFF", "ADMIN"]),
  permissions: z.array(z.enum(adminModules)).max(adminModules.length).default([])
});

const updateSchema = z.object({
  id: z.string().cuid(),
  role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).optional(),
  permissions: z.array(z.enum(adminModules)).max(adminModules.length).optional(),
  active: z.boolean().optional()
}).refine((value) => value.role !== undefined || value.permissions !== undefined || value.active !== undefined);

export async function GET() {
  const actor = await requireAdminApi();
  if (isResponse(actor)) return actor;
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, email: true, role: true, active: true, permissions: true },
    orderBy: [{ role: "asc" }, { name: "asc" }]
  });
  return Response.json({ users });
}

export async function POST(request: Request) {
  const actor = await requireAdminApi();
  if (isResponse(actor)) return actor;
  let input: unknown;
  try { input = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Xodim ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { ...parsed.data, passwordHash },
        select: { id: true, name: true, email: true, role: true, active: true, permissions: true }
      });
      if (actor.role !== "FOUNDER" && created.role === "ADMIN") throw new Error("ONLY_FOUNDER_CAN_CREATE_ADMIN");
      await tx.auditLog.create({
        data: { actorId: actor.id, action: "USER_CREATED", entity: "User", entityId: created.id, metadata: { role: created.role } }
      });
      return created;
    });
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Bu email allaqachon ro‘yxatdan o‘tgan." }, { status: 409 });
    }
    if (error instanceof Error && error.message === "ONLY_FOUNDER_CAN_CREATE_ADMIN") {
      return Response.json({ error: "Faqat asoschi administrator hisobi yarata oladi." }, { status: 403 });
    }
    console.error("Staff account creation failed", error);
    return Response.json({ error: "Xodim hisobini yaratib bo‘lmadi." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const actor = await requireAdminApi();
  if (isResponse(actor)) return actor;
  let input: unknown;
  try { input = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Rol yoki faol holati noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.id === actor.id) return Response.json({ error: "O‘z hisobingizning rolini yoki faol holatini bu yerdan o‘zgartira olmaysiz." }, { status: 400 });

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id: parsed.data.id }, select: { id: true, role: true, active: true, deletedAt: true } });
      if (!target) return null;
      if (target.deletedAt) throw new Error("USER_DELETED");
      if (target.role === "FOUNDER") throw new Error("FOUNDER_IMMUTABLE");
      if (actor.role !== "FOUNDER" && target.role === "ADMIN") throw new Error("ONLY_FOUNDER_CAN_MANAGE_ADMIN");
      if (actor.role !== "FOUNDER" && parsed.data.role === "ADMIN") throw new Error("ONLY_FOUNDER_CAN_CREATE_ADMIN");
      const nextRole = parsed.data.role ?? target.role;
      const nextActive = parsed.data.active ?? target.active;
      const user = await tx.user.update({
        where: { id: target.id },
        data: {
          ...(parsed.data.role ? { role: parsed.data.role } : {}),
          ...(parsed.data.permissions ? { permissions: parsed.data.permissions as AdminModule[] } : {}),
          ...(parsed.data.active !== undefined ? { active: parsed.data.active } : {})
        },
        select: { id: true, name: true, email: true, role: true, active: true, permissions: true }
      });
      if (nextRole !== target.role || !nextActive || parsed.data.permissions) await tx.session.deleteMany({ where: { userId: target.id } });
      await tx.auditLog.create({
        data: { actorId: actor.id, action: "USER_PERMISSIONS_UPDATED", entity: "User", entityId: target.id, metadata: { from: target.role, to: nextRole, active: nextActive } }
      });
      return user;
    });
    if (!updated) return Response.json({ error: "Foydalanuvchi topilmadi." }, { status: 404 });
    return Response.json({ user: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "LAST_ACTIVE_ADMIN") {
      return Response.json({ error: "Tizimda kamida bitta faol administrator qolishi shart." }, { status: 409 });
    }
    if (error instanceof Error && error.message === "FOUNDER_IMMUTABLE") {
      return Response.json({ error: "Asoschi rolini yoki faol holatini o‘zgartirib bo‘lmaydi." }, { status: 403 });
    }
    if (error instanceof Error && error.message === "USER_DELETED") {
      return Response.json({ error: "O‘chirilgan foydalanuvchini o‘zgartirib bo‘lmaydi." }, { status: 410 });
    }
    if (error instanceof Error && (error.message === "ONLY_FOUNDER_CAN_MANAGE_ADMIN" || error.message === "ONLY_FOUNDER_CAN_CREATE_ADMIN")) {
      return Response.json({ error: "Faqat asoschi administrator akkauntlarini boshqara oladi." }, { status: 403 });
    }
    console.error("User role update failed", error);
    return Response.json({ error: "Hisob ruxsatlarini yangilab bo‘lmadi." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const actor = await requireAdminApi();
  if (isResponse(actor)) return actor;
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = z.object({ id: z.string().cuid() }).safeParse(input);
  if (!parsed.success) return Response.json({ error: "Foydalanuvchi tanlanmadi." }, { status: 400 });
  if (parsed.data.id === actor.id) return Response.json({ error: "O‘z hisobingizni o‘chira olmaysiz." }, { status: 400 });

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: parsed.data.id },
        select: { id: true, role: true, deletedAt: true }
      });
      if (!target) return "NOT_FOUND" as const;
      if (target.deletedAt) return "ALREADY_DELETED" as const;
      if (target.role === "FOUNDER") throw new Error("FOUNDER_IMMUTABLE");
      if (target.role === "ADMIN" && actor.role !== "FOUNDER") throw new Error("ONLY_FOUNDER_CAN_DELETE_ADMIN");

      await tx.user.update({
        where: { id: target.id },
        data: {
          name: "O‘chirilgan foydalanuvchi",
          email: `deleted-${target.id}@deleted.invalid`,
          phone: null,
          active: false,
          deletedAt: new Date()
        }
      });
      await tx.session.deleteMany({ where: { userId: target.id } });
      await tx.serviceRequest.updateMany({
        where: { customerId: target.id },
        data: {
          customerId: null,
          name: "Deleted account",
          phone: "",
          email: null,
          organizationName: null,
          city: null,
          location: null,
          description: "[Request details removed after account deletion]",
          budgetRange: null,
          preferredContactTime: null
        }
      });
      await tx.project.updateMany({
        where: { customerId: target.id },
        data: { customerId: null, name: "Archived customer project", notes: null, city: null }
      });
      await tx.organizationMember.deleteMany({ where: { userId: target.id } });
      await tx.notification.deleteMany({ where: { userId: target.id } });
      await tx.auditLog.create({
        data: { actorId: actor.id, action: "USER_DELETED", entity: "User", entityId: target.id }
      });
      return "DELETED" as const;
    });

    if (deleted === "NOT_FOUND") return Response.json({ error: "Foydalanuvchi topilmadi." }, { status: 404 });
    if (deleted === "ALREADY_DELETED") return Response.json({ error: "Foydalanuvchi avval o‘chirilgan." }, { status: 409 });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FOUNDER_IMMUTABLE") {
      return Response.json({ error: "Asoschi hisobini o‘chirib bo‘lmaydi." }, { status: 403 });
    }
    if (error instanceof Error && error.message === "ONLY_FOUNDER_CAN_DELETE_ADMIN") {
      return Response.json({ error: "Administrator hisobini faqat asoschi o‘chira oladi." }, { status: 403 });
    }
    console.error("User deletion failed", error);
    return Response.json({ error: "Foydalanuvchini o‘chirib bo‘lmadi." }, { status: 500 });
  }
}
