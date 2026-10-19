import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
  audience: z.enum(["customer", "staff"]).optional().default("customer")
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(5000),
  icon: z.string().trim().max(12).optional().default("IT"),
  pricingType: z.enum(["ONE_TIME", "MONTHLY", "ANNUAL", "QUOTE"]).default("QUOTE"),
  startingPriceMinor: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().length(3).default("UZS"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  availability: z.boolean().default(true),
  media: z.array(z.string().cuid()).max(20).default([])
});

export const requestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  organizationName: z.string().trim().max(160).optional(),
  city: z.string().trim().max(100).optional(),
  location: z.string().trim().max(500).optional(),
  serviceId: z.string().cuid().optional().or(z.literal("")),
  description: z.string().trim().min(5).max(5000),
  budgetRange: z.string().trim().max(100).optional(),
  preferredContactTime: z.string().trim().max(120).optional(),
  consent: z.literal(true)
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5).max(5000),
  sku: z.string().trim().max(80).optional(),
  brand: z.string().trim().max(100).optional(),
  model: z.string().trim().max(120).optional(),
  priceMinor: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().length(3).default("UZS"),
  stockStatus: z.enum(["UNKNOWN", "IN_STOCK", "OUT_OF_STOCK", "ON_REQUEST"]).default("UNKNOWN"),
  warrantyDescription: z.string().trim().max(500).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  media: z.array(z.string().cuid()).max(20).default([])
});

export const projectSchema = z.object({
  name: z.string().trim().min(2).max(160),
  city: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(3000).optional(),
  items: z.array(z.object({
    productId: z.string().cuid().optional(),
    serviceId: z.string().cuid().optional(),
    quantity: z.number().int().min(1).max(1000)
  }).refine((item) => Boolean(item.productId) !== Boolean(item.serviceId), "Har bir qator mahsulot yoki xizmatdan bittasini tanlashi kerak.")).max(100).default([])
});

export const quotationSchema = z.object({
  projectId: z.string().cuid(),
  currency: z.string().length(3).default("UZS"),
  validUntil: z.string().datetime().optional(),
  assumptions: z.string().trim().max(5000).optional(),
  exclusions: z.string().trim().max(5000).optional(),
  items: z.array(z.object({
    productId: z.string().cuid().optional(),
    serviceId: z.string().cuid().optional(),
    description: z.string().trim().min(2).max(500),
    quantity: z.number().int().min(1).max(10000),
    unitPriceMinor: z.number().int().nonnegative(),
    discountMinor: z.number().int().nonnegative().default(0)
  }).refine((item) => !(item.productId && item.serviceId), "Bir qatorga mahsulot va xizmatni birga bog‘lab bo‘lmaydi.")).min(1).max(100)
});

export const organizationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  type: z.string().trim().max(100).optional(),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
  billingAddress: z.string().trim().max(500).optional(),
  location: z.object({
    name: z.string().trim().min(2).max(120),
    address: z.string().trim().min(3).max(500),
    city: z.string().trim().max(100).optional()
  }).optional()
});

export const deviceSchema = z.object({
  organizationId: z.string().cuid(),
  locationId: z.string().cuid().optional(),
  type: z.string().trim().min(2).max(100),
  manufacturer: z.string().trim().max(100).optional(),
  model: z.string().trim().max(120).optional(),
  serialNumber: z.string().trim().max(160).optional(),
  hostname: z.string().trim().max(253).optional(),
  installedAt: z.string().datetime().optional(),
  warrantyEndsAt: z.string().datetime().optional()
});

export const newsSchema = z.object({
  title: z.string().trim().min(3).max(180),
  excerpt: z.string().trim().min(5).max(500),
  content: z.string().trim().min(20).max(20000),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  media: z.array(z.string().cuid()).max(20).default([])
});

export const invoiceSchema = z.object({
  quotationId: z.string().cuid(),
  dueAt: z.string().datetime().optional()
});

export const manualPaymentSchema = z.object({
  amountMinor: z.number().int().positive().max(2_000_000_000),
  method: z.enum(["BANK_TRANSFER", "CASH", "OTHER"]),
  reference: z.string().trim().min(2).max(160)
});

export const subscriptionPlanSchema = z.object({
  name: z.string().trim().min(2).max(100),
  interval: z.enum(["MONTHLY", "ANNUAL", "CUSTOM"]),
  priceMinor: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().length(3).default("UZS"),
  trialDays: z.number().int().min(0).max(90).default(30),
  features: z.array(z.string().trim().min(1).max(160)).max(30).default([])
});

export const subscriptionSchema = z.object({
  organizationId: z.string().cuid(),
  planId: z.string().cuid(),
  consent: z.literal(true)
});
