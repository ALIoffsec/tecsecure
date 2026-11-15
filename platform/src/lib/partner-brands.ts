import { z } from "zod";
import type { Locale } from "./messages";

/**
 * The two rows of brand logos on the home page. Staff edit them in the admin panel (Sayt bloklari): a logo
 * is either one of the bundled files in /public/brands or an image they uploaded (its media id).
 * Until anything is saved, the bundled set below is shown.
 */
export const PARTNER_BRANDS_KEY = "partnerBrands";
export const MAX_BRANDS_PER_ROW = 30;

const bundledLogo = /^\/brands\/[a-z0-9-]+\.(svg|png)$/;
const mediaId = /^[a-z0-9]{20,40}$/;

const brandSchema = z.object({
  name: z.string().trim().min(1).max(40),
  logo: z.string().trim().refine(value => bundledLogo.test(value) || mediaId.test(value), "Logo noto‘g‘ri.")
}).strict();
const localized = z.object({ uz: z.string().trim().max(120), ru: z.string().trim().max(120), en: z.string().trim().max(120) }).strict();

export const partnerBrandsSchema = z.object({
  title: localized,
  note: localized,
  rows: z.tuple([z.array(brandSchema).max(MAX_BRANDS_PER_ROW), z.array(brandSchema).max(MAX_BRANDS_PER_ROW)])
}).strict();
export type PartnerBrands = z.infer<typeof partnerBrandsSchema>;
export type PartnerBrand = PartnerBrands["rows"][number][number];

const brand = (name: string, file: string): PartnerBrand => ({ name, logo: `/brands/${file}` });

/** The logos that were on the site before; empty title and note fall back to the words below. */
export const defaultPartnerBrands: PartnerBrands = {
  title: { uz: "", ru: "", en: "" },
  note: { uz: "", ru: "", en: "" },
  rows: [
    [brand("Cisco", "cisco.svg"), brand("MikroTik", "mikrotik.svg"), brand("TP-Link", "tplink.svg"), brand("Ubiquiti", "ubiquiti.svg"), brand("Juniper", "juniper.svg"), brand("Huawei", "huawei.svg"), brand("ASUS", "asus.svg")],
    [brand("Hikvision", "hikvision.png"), brand("Cudy", "cudy.png"), brand("D-Link", "dlink.png"), brand("Zyxel", "zyxel.png"), brand("Grandstream", "grandstream.png"), brand("Tenda", "tenda.png")]
  ]
};

export const partnerBrandsCopy: Record<Locale, { title: string; note: string }> = {
  uz: { title: "Biz ishlaydigan brendlar", note: "Shu brendlarning tarmoq va xavfsizlik uskunalarini o‘rnatamiz, sozlaymiz va xizmat ko‘rsatamiz." },
  ru: { title: "Бренды, с которыми мы работаем", note: "Устанавливаем, настраиваем и обслуживаем сетевое оборудование и системы безопасности этих брендов." },
  en: { title: "Brands we work with", note: "We install, configure and service network and security equipment from these brands." }
};

/** What is stored, or the bundled set when nothing (or something unreadable) is stored. */
export function parsePartnerBrands(raw: string | null | undefined): PartnerBrands {
  if (!raw) return defaultPartnerBrands;
  try {
    const parsed = partnerBrandsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : defaultPartnerBrands;
  } catch {
    return defaultPartnerBrands;
  }
}

/** Where the browser loads a logo from. */
export function brandLogoSrc(logo: string): string {
  return logo.startsWith("/brands/") ? logo : `/api/media/${logo}`;
}
