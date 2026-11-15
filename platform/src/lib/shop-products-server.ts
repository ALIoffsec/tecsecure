import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { currentShopOwner } from "./shop-server";
import { releaseDueCredits } from "./marketplace-server";
import type { AuthUser } from "./auth";
import type { SellerProductInput } from "./marketplace";

export const noStore = { "Cache-Control": "private, no-store" };

type ActiveShop = { user: AuthUser; shop: NonNullable<Awaited<ReturnType<typeof prisma.shop.findUnique>>> };

/** The signed-in owner of an ACTIVE shop; selling tools are closed while a shop waits, is rejected or suspended. */
export async function requireSellingShop(): Promise<ActiveShop | Response> {
  const owner = await currentShopOwner();
  if (owner instanceof Response) return owner;
  if (!owner.shop) return Response.json({ error: "Avval do‘kon arizasini yuboring.", code: "NO_SHOP" }, { status: 404 });
  if (owner.shop.status !== "ACTIVE") return Response.json({ error: "Do‘kon faol emas: mahsulot va buyurtmalar tasdiqlangandan keyin ochiladi.", code: "SHOP_NOT_ACTIVE" }, { status: 403 });
  // Money whose hold has passed lands before anything reads the balance.
  if (await releaseDueCredits(owner.shop.id)) {
    const shop = await prisma.shop.findUnique({ where: { id: owner.shop.id } });
    if (shop) return { user: owner.user, shop };
  }
  return { user: owner.user, shop: owner.shop };
}

/** Photos on a listing must be images this owner uploaded (never someone else's file or a private receipt). */
export async function photosBelongTo(ownerId: string, ids: string[]): Promise<boolean> {
  const unique = [...new Set(ids)];
  if (unique.length !== ids.length) return false;
  const count = await prisma.mediaAsset.count({ where: { id: { in: unique }, ownerId, private: false, mimeType: { startsWith: "image/" } } });
  return count === unique.length;
}

/** The database fields for a seller's form (empty optional text becomes null). */
export function sellerProductData(input: SellerProductInput): Omit<Prisma.ProductUncheckedCreateInput, "slug" | "status"> {
  return {
    name: input.name,
    description: input.description,
    categoryId: input.categoryId,
    brand: input.brand || null,
    model: input.model || null,
    sku: input.sku || null,
    priceMinor: input.priceMinor,
    currency: input.currency,
    stockQuantity: input.stockQuantity,
    warrantyDescription: input.warrantyDescription || null,
    specifications: input.specifications,
    media: input.media,
    translations: input.translations ?? undefined
  };
}

export function productSlug(name: string): string {
  const base = name.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[‘’ʻʼ'`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "mahsulot";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

/** What the seller app shows for each listing. */
export const sellerProductSelect = {
  id: true, name: true, slug: true, description: true, categoryId: true, brand: true, model: true, sku: true, priceMinor: true, currency: true,
  stockQuantity: true, stockStatus: true, warrantyDescription: true, specifications: true, media: true, translations: true,
  status: true, moderation: true, moderationNote: true, sellerHidden: true, promotedUntil: true, viewCount: true, createdAt: true, updatedAt: true,
  category: { select: { name: true } }
} satisfies Prisma.ProductSelect;
