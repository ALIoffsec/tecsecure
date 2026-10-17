import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "tecsecure_session";
const ADMIN_ACCESS_COOKIE = "tecsecure_admin_access";
const SESSION_DAYS = 14;
const ADMIN_ACCESS_MINUTES = 30;

export const adminModules = ["REQUESTS", "PROJECTS", "SERVICES", "PRODUCTS", "NEWS", "COMPANY", "USERS", "SUBSCRIPTIONS", "PAYMENTS", "CONTENT", "PORTFOLIO", "WALLET", "SYSTEM"] as const;
export type AdminModule = typeof adminModules[number];

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN" | "FOUNDER";
  permissions: AdminModule[];
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, adminAccess = false): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const adminToken = adminAccess ? randomBytes(32).toString("base64url") : null;
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const adminExpiresAt = adminAccess ? new Date(Date.now() + ADMIN_ACCESS_MINUTES * 60 * 1000) : null;
  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt, adminAccessHash: adminToken ? hashToken(adminToken) : null }
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });
  if (adminToken && adminExpiresAt) {
    cookieStore.set(ADMIN_ACCESS_COOKIE, adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: adminExpiresAt
    });
  } else {
    cookieStore.delete(ADMIN_ACCESS_COOKIE);
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ADMIN_ACCESS_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      expiresAt: true,
      user: {
        select: { id: true, name: true, email: true, role: true, active: true, permissions: true }
      }
    }
  });

  if (!session || session.expiresAt <= new Date() || !session.user.active) {
    if (session) {
      await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
    }
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    permissions: Array.isArray(session.user.permissions)
      ? session.user.permissions.filter((value): value is AdminModule => typeof value === "string" && adminModules.includes(value as AdminModule))
      : []
  };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdminPage(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/staff/login");
  if (user.role === "CUSTOMER") redirect("/portal");
  if (!(await hasAdminAccess())) redirect("/staff/login");
  return user;
}

async function hasAdminAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value;
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!adminToken || !sessionToken) return false;
  const access = await prisma.session.findFirst({
    where: {
      tokenHash: hashToken(sessionToken),
      adminAccessHash: hashToken(adminToken),
      expiresAt: { gt: new Date() }
    },
    select: { id: true }
  });
  return access !== null;
}

export async function requireAdminApi(): Promise<AuthUser | Response> {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "ADMIN" && user.role !== "FOUNDER") {
    return Response.json({ error: "Bu amal uchun ruxsat yo‘q." }, { status: 403 });
  }
  if (!(await hasAdminAccess())) return Response.json({ error: "Admin paneliga qayta kirish talab qilinadi." }, { status: 401 });
  return user;
}

export async function requireModuleApi(module: AdminModule): Promise<AuthUser | Response> {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "FOUNDER" && user.role !== "ADMIN" && (user.role !== "STAFF" || !user.permissions.includes(module))) {
    return Response.json({ error: "Bu bo‘lim uchun ruxsat yo‘q." }, { status: 403 });
  }
  if (!(await hasAdminAccess())) return Response.json({ error: "Admin paneliga qayta kirish talab qilinadi." }, { status: 401 });
  return user;
}

export async function endAdminAccess(): Promise<void> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value;
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (adminToken && sessionToken) {
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(sessionToken), adminAccessHash: hashToken(adminToken) },
      data: { adminAccessHash: null }
    });
  }
  cookieStore.delete(ADMIN_ACCESS_COOKIE);
}

export async function requireOperationsApi(): Promise<AuthUser | Response> {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "FOUNDER" && user.role !== "ADMIN" && user.role !== "STAFF") {
    return Response.json({ error: "Bu amal uchun ruxsat yo‘q." }, { status: 403 });
  }
  if (!(await hasAdminAccess())) return Response.json({ error: "Admin paneliga qayta kirish talab qilinadi." }, { status: 401 });
  return user;
}

export function isResponse(value: AuthUser | Response): value is Response {
  return value instanceof Response;
}
