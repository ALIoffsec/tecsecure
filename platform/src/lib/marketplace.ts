import { z } from "zod";
import { shopShare } from "./shops";

/**
 * The rules of selling on Tecsecure that do not touch the database, so each one is tested on its own:
 * when a shop's listing is public, what sends it back to review, how a delivery fee is shared, what a
 * shop earns from its part of an order, and what a paid placement costs.
 */

export const moderationStates = ["PENDING", "APPROVED", "REJECTED"] as const;
export type Moderation = (typeof moderationStates)[number];

/** A shop's product is on sale only when staff approved it, the shop has not hidden it, and the shop is active. */
export function shopProductIsPublic(moderation: string, sellerHidden: boolean, shopStatus: string): boolean {
  return moderation === "APPROVED" && !sellerHidden && shopStatus === "ACTIVE";
}

export const SELLER_CURRENCIES = ["UZS", "USD"] as const;
export const MAX_PRODUCT_PHOTOS = 10;
export const LOW_STOCK = 3;
const MAX_PRICE_MINOR = 100_000_000_000_00;

const detailValue = z.union([z.string().trim().max(300), z.number(), z.boolean()]);
const language = z.object({
  name: z.string().trim().max(160).optional(),
  description: z.string().trim().max(5000).optional()
}).strict();

/** What a shop sends to list or change a product. Photos come first: at least one is required. */
export const sellerProductSchema = z.object({
  name: z.string().trim().min(3).max(160),
  description: z.string().trim().min(20).max(5000),
  categoryId: z.string().cuid(),
  brand: z.string().trim().max(100).optional().or(z.literal("")),
  model: z.string().trim().max(120).optional().or(z.literal("")),
  sku: z.string().trim().max(80).optional().or(z.literal("")),
  priceMinor: z.number().int().positive().max(MAX_PRICE_MINOR),
  currency: z.enum(SELLER_CURRENCIES).default("UZS"),
  stockQuantity: z.number().int().min(0).max(1_000_000).nullable(),
  warrantyDescription: z.string().trim().max(300).optional().or(z.literal("")),
  specifications: z.record(z.string().trim().min(1).max(80), detailValue).refine(value => Object.keys(value).length <= 40, "Ko‘pi bilan 40 ta xususiyat.").default({}),
  media: z.array(z.string().cuid()).min(1, "Kamida bitta rasm yuklang.").max(MAX_PRODUCT_PHOTOS),
  translations: z.object({ ru: language.optional(), en: language.optional() }).strict().optional()
}).strict();
export type SellerProductInput = z.infer<typeof sellerProductSchema>;

/** Quick changes that never need review: price, stock, on/off sale. */
export const sellerQuickSchema = z.object({
  priceMinor: z.number().int().positive().max(MAX_PRICE_MINOR).optional(),
  currency: z.enum(SELLER_CURRENCIES).optional(),
  stockQuantity: z.number().int().min(0).max(1_000_000).nullable().optional(),
  sellerHidden: z.boolean().optional()
}).strict().refine(value => Object.keys(value).length > 0);

type ContentFields = Pick<SellerProductInput, "name" | "description" | "categoryId" | "brand" | "model" | "warrantyDescription" | "specifications" | "media" | "translations">;
const normalize = (value: unknown) => JSON.stringify(value ?? null, (_key, item) => item === "" ? null : item);

/**
 * Whether an edit goes back to staff review. Text, photos, category and details can mislead buyers, so
 * they are checked again; price and stock change on their own.
 */
export function editNeedsReview(before: Partial<ContentFields>, after: ContentFields): boolean {
  const keys: (keyof ContentFields)[] = ["name", "description", "categoryId", "brand", "model", "warrantyDescription", "specifications", "media", "translations"];
  return keys.some(key => normalize(before[key]) !== normalize(after[key]));
}

/** The stock word the catalogue shows, from a counted quantity (null keeps the seller's own word). */
export function stockStatusFor(quantity: number | null, fallback: string): string {
  if (quantity === null) return fallback;
  return quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK";
}

/**
 * One delivery fee shared between the parties that ship parts of an order, in proportion to the value of
 * the goods each ships, rounded to whole so'm; the rounding remainder goes to the largest part so the
 * shares always add up to the fee.
 */
export function splitDelivery(feeMinor: number | null, parts: { key: string; itemsMinor: number }[]): Map<string, number> {
  const shares = new Map<string, number>();
  if (feeMinor === null || parts.length === 0) return shares;
  const total = parts.reduce((sum, part) => sum + part.itemsMinor, 0);
  if (total <= 0) {
    parts.forEach((part, index) => shares.set(part.key, index === 0 ? feeMinor : 0));
    return shares;
  }
  let given = 0;
  for (const part of parts) {
    const share = Math.floor((feeMinor * part.itemsMinor) / total / 100) * 100;
    shares.set(part.key, share);
    given += share;
  }
  const largest = [...parts].sort((a, b) => b.itemsMinor - a.itemsMinor)[0];
  shares.set(largest.key, (shares.get(largest.key) ?? 0) + (feeMinor - given));
  return shares;
}

/** What a shop earns from its part of an order: goods less commission, plus its share of the delivery fee. */
export function shopOrderMoney(itemsMinor: number | null, commissionPercent: number, deliveryShareMinor: number | null) {
  if (itemsMinor === null) return { commissionMinor: null, payoutMinor: null };
  const { commissionMinor, payoutMinor } = shopShare(itemsMinor, commissionPercent);
  return { commissionMinor, payoutMinor: payoutMinor + (deliveryShareMinor ?? 0) };
}

/** Earnings reach the balance once: the shop delivered and the customer's money is in. */
export function canCredit(shipment: { status: string; creditedAt: Date | null; payoutMinor: number | null }, paymentStatus: string): boolean {
  return shipment.status === "DELIVERED" && shipment.creditedAt === null && shipment.payoutMinor !== null && paymentStatus === "PAID";
}

/** The commission for a shop's part: the lower rate when the shop's own QR or page brought the buyer. */
export function commissionFor(shop: { id: string; commissionPercent: number; referralCommissionPercent: number }, referralShopId: string | null): number {
  return referralShopId === shop.id ? shop.referralCommissionPercent : shop.commissionPercent;
}

/** Paid placement. Staff set the price per day; with no price set, shops cannot buy it. */
export const PROMOTION_KEY = "shopPromotion";
export const promotionSettingsSchema = z.object({
  pricePerDayMinor: z.number().int().positive().max(MAX_PRICE_MINOR).nullable(),
  maxDays: z.number().int().min(1).max(90)
}).strict();
export type PromotionSettings = z.infer<typeof promotionSettingsSchema>;
export const defaultPromotion: PromotionSettings = { pricePerDayMinor: null, maxDays: 30 };

export function parsePromotion(raw: string | null | undefined): PromotionSettings {
  if (!raw) return defaultPromotion;
  try {
    const parsed = promotionSettingsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : defaultPromotion;
  } catch {
    return defaultPromotion;
  }
}

/** Price of a placement, or null when it cannot be bought (no price set, or days out of range). */
export function promotionCost(settings: PromotionSettings, days: number): number | null {
  if (settings.pricePerDayMinor === null || !Number.isInteger(days) || days < 1 || days > settings.maxDays) return null;
  return settings.pricePerDayMinor * days;
}

/** A new placement starts now, or extends one still running. */
export function promotionEnd(current: Date | null, days: number, now = new Date()): Date {
  const start = current && current > now ? current : now;
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
}

/** Bank details for payouts: a 20-digit business account and a 5-digit MFO; never a card number. */
export const payoutDetailsSchema = z.object({
  payoutBankName: z.string().trim().min(2).max(120),
  payoutAccount: z.string().trim().transform(value => value.replace(/\s+/g, "")).pipe(z.string().regex(/^\d{20}$/, "Hisob raqami 20 ta raqam.")),
  payoutMfo: z.string().trim().regex(/^\d{5}$/, "MFO 5 ta raqam."),
  payoutRecipient: z.string().trim().min(2).max(160)
}).strict();
