import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { regionNames } from "@/lib/delivery";
import { escapeTelegramHtml } from "@/lib/telegram";
import { shopProfileSchema, type ShopProfile } from "@/lib/shops";
import { currentShopOwner, freeShopSlug, notifyStaffPlain } from "@/lib/shop-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "private, no-store" };

async function readProfile(request: Request, ownerId: string): Promise<ShopProfile | Response> {
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = shopProfileSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Do‘kon ma’lumotlarini tekshiring.", details: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.logoMediaId) {
    const logo = await prisma.mediaAsset.findUnique({ where: { id: parsed.data.logoMediaId }, select: { mimeType: true, private: true, ownerId: true } });
    // A private file (someone's payment receipt) can never become a public logo, whoever knows its id.
    if (!logo?.mimeType.startsWith("image/") || (logo.private && logo.ownerId !== ownerId)) return Response.json({ error: "Logotip rasm bo‘lishi kerak." }, { status: 400 });
  }
  return parsed.data;
}

const clean = (profile: ShopProfile) => ({
  ...profile,
  telegram: profile.telegram?.replace(/^@/, "") || null,
  instagram: profile.instagram?.replace(/^@/, "") || null,
  description: profile.description || null,
  logoMediaId: profile.logoMediaId ?? null
});

export async function GET() {
  const owner = await currentShopOwner();
  if (owner instanceof Response) return owner;
  return Response.json({ shop: owner.shop }, { headers: noStore });
}

/** A customer applies to sell. The shop stays PENDING, and invisible, until staff approve it. */
export async function POST(request: Request) {
  const owner = await currentShopOwner();
  if (owner instanceof Response) return owner;
  if (owner.shop) return Response.json({ error: "Sizda do‘kon allaqachon bor.", code: "SHOP_EXISTS" }, { status: 409 });
  if (!(await checkRateLimit("shop-apply", owner.user.id, 5, 24 * 60 * 60 * 1000))) {
    return Response.json({ error: "Urinishlar limiti oshdi. Ertaga qayta urinib ko‘ring." }, { status: 429 });
  }
  const profile = await readProfile(request, owner.user.id);
  if (profile instanceof Response) return profile;
  try {
    const shop = await prisma.$transaction(async (tx) => {
      const created = await tx.shop.create({ data: { ...clean(profile), slug: await freeShopSlug(profile.name), ownerId: owner.user.id } });
      await tx.auditLog.create({ data: { actorId: owner.user.id, action: "SHOP_APPLIED", entity: "Shop", entityId: created.id } });
      return created;
    });
    await notifyStaffPlain([
      "<b>🏪 Yangi do‘kon arizasi</b>",
      `Nomi: ${escapeTelegramHtml(shop.name)}`,
      `Telefon: ${escapeTelegramHtml(shop.phone)}`,
      `Hudud: ${escapeTelegramHtml(regionNames.uz[profile.region])}, ${escapeTelegramHtml(profile.city)}`,
      `Yuridik shaxs: ${escapeTelegramHtml(profile.legalName)} (STIR ${escapeTelegramHtml(profile.tin)})`,
      "",
      "Admin panel → Do‘konlar bo‘limida ko‘rib chiqing."
    ].join("\n"));
    return Response.json({ shop }, { status: 201, headers: noStore });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Sizda do‘kon allaqachon bor.", code: "SHOP_EXISTS" }, { status: 409 });
    }
    console.error("Shop application failed", error);
    return Response.json({ error: "Arizani saqlab bo‘lmadi. Qayta urinib ko‘ring." }, { status: 500 });
  }
}

/** The owner keeps the profile current. The address part of the link never changes, so printed QR codes keep working. */
export async function PATCH(request: Request) {
  const owner = await currentShopOwner();
  if (owner instanceof Response) return owner;
  if (!owner.shop) return Response.json({ error: "Avval do‘kon arizasini yuboring." }, { status: 404 });
  if (owner.shop.status === "SUSPENDED") return Response.json({ error: "Do‘kon to‘xtatilgan. Admin bilan bog‘laning.", code: "SHOP_SUSPENDED" }, { status: 403 });
  const profile = await readProfile(request, owner.user.id);
  if (profile instanceof Response) return profile;
  // A rejected application is sent again by editing it.
  const resubmit = owner.shop.status === "REJECTED";
  const shop = await prisma.$transaction(async (tx) => {
    const updated = await tx.shop.update({ where: { id: owner.shop!.id }, data: { ...clean(profile), ...(resubmit ? { status: "PENDING", reviewNote: null } : {}) } });
    await tx.auditLog.create({ data: { actorId: owner.user.id, action: resubmit ? "SHOP_RESUBMITTED" : "SHOP_PROFILE_UPDATED", entity: "Shop", entityId: updated.id } });
    return updated;
  });
  return Response.json({ shop }, { headers: noStore });
}
