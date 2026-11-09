import { z } from "zod";
import { regionCodes } from "./delivery";

export const shopStatuses = ["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"] as const;
export type ShopStatus = (typeof shopStatuses)[number];

export const DEFAULT_COMMISSION = 15;
export const DEFAULT_REFERRAL_COMMISSION = 10;

const cyrillic: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu",
  я: "ya", ў: "o", қ: "q", ғ: "g", ҳ: "h"
};

/** A short Latin address part from a shop name in any script: "Kamera Markazi" → "kamera-markazi". */
export function shopSlug(name: string): string {
  const latin = [...name.toLowerCase()].map(char => cyrillic[char] ?? char).join("")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[‘’ʻʼ'`]/g, "");
  return latin.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "") || "dokon";
}

const phone = z.string().trim().min(7).max(30).regex(/^[+\d\s()-]+$/);
const handle = z.string().trim().max(80).regex(/^@?[\w.]*$/).optional().or(z.literal(""));

/** What a customer sends to open a shop, and later edits in the cabinet. */
export const shopProfileSchema = z.object({
  name: z.string().trim().min(2).max(60),
  phone,
  telegram: handle,
  instagram: handle,
  region: z.enum(regionCodes),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(300),
  description: z.string().trim().max(600).optional().or(z.literal("")),
  legalName: z.string().trim().min(2).max(160),
  tin: z.string().trim().regex(/^\d{9}$|^\d{14}$/),
  logoMediaId: z.string().cuid().nullable().optional()
});
export type ShopProfile = z.infer<typeof shopProfileSchema>;

export const shopReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "SUSPEND", "REACTIVATE", "UPDATE"]),
  note: z.string().trim().max(500).optional(),
  commissionPercent: z.number().min(0).max(50).optional(),
  referralCommissionPercent: z.number().min(0).max(50).optional()
}).refine(review => review.action !== "REJECT" || (review.note?.length ?? 0) >= 3, { path: ["note"], message: "Sababini yozing." });

/** Which status each staff action leads to, from where. Null means the action does not apply. */
export function nextShopStatus(current: string, action: "APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE" | "UPDATE"): ShopStatus | null {
  if (action === "UPDATE") return current as ShopStatus;
  if (action === "APPROVE") return current === "PENDING" || current === "REJECTED" ? "ACTIVE" : null;
  if (action === "REJECT") return current === "PENDING" ? "REJECTED" : null;
  if (action === "SUSPEND") return current === "ACTIVE" ? "SUSPENDED" : null;
  return current === "SUSPENDED" ? "ACTIVE" : null;
}

/**
 * The shop's share of one goods line, in so'm minor units: the price less Tecsecure's commission,
 * rounded to whole so'm so balances never carry fractions of a tiyin.
 */
export function shopShare(lineMinor: number, commissionPercent: number): { commissionMinor: number; payoutMinor: number } {
  const commissionMinor = Math.round((lineMinor * commissionPercent) / 100 / 100) * 100;
  return { commissionMinor, payoutMinor: lineMinor - commissionMinor };
}
