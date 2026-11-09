import { Prisma } from "@prisma/client";
import { mediaIds } from "./catalog-utils";
import { prisma } from "./prisma";

/** What each order line needs to show the product itself: its page and its photo. */
export const orderItemsWithProduct = {
  include: { product: { select: { slug: true, status: true, media: true } } }
} satisfies Prisma.Order$itemsArgs;

type LineWithProduct = {
  product: { slug: string; status: string; media: Prisma.JsonValue } | null;
};

/** The product's link (only while it is on sale) and its first photo, for an order line. */
export type OrderLineProduct = { href: string | null; imageId: string | null };

type WithLines<O extends { items: LineWithProduct[] }> = Omit<O, "items"> & { items: (Omit<O["items"][number], "product"> & { product: OrderLineProduct })[] };

/**
 * Replaces each line's raw product record with a link and a photo id. Media can be videos or missing files,
 * so the first id that really is an image wins; lines whose product was deleted keep only their saved name.
 */
export async function withLineProducts<O extends { items: LineWithProduct[] }>(orders: O[]): Promise<WithLines<O>[]> {
  const ids = [...new Set(orders.flatMap(order => order.items.flatMap(item => mediaIds(item.product?.media))))];
  const images = ids.length
    ? new Set((await prisma.mediaAsset.findMany({ where: { id: { in: ids }, mimeType: { startsWith: "image/" }, private: false }, select: { id: true } })).map(asset => asset.id))
    : new Set<string>();
  // Generic spreads lose the item shape, so the result is stated once here.
  return orders.map(order => ({
    ...order,
    items: order.items.map(({ product, ...item }) => ({
      ...item,
      product: {
        href: product && product.status === "PUBLISHED" ? `/products/${product.slug}` : null,
        imageId: mediaIds(product?.media).find(id => images.has(id)) ?? null
      } satisfies OrderLineProduct
    }))
  })) as unknown as WithLines<O>[];
}
