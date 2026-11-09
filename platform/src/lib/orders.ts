import { z } from "zod";
import { deliveryMethods, regionCodes } from "./delivery";

export const orderStatuses = ["NEW", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type OrderStatusValue = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatusValue, string> = {
  NEW: "Qabul qilindi",
  CONFIRMED: "Tasdiqlandi",
  PREPARING: "Tayyorlanmoqda",
  SHIPPED: "Yo‘lda",
  DELIVERED: "Yetkazildi",
  CANCELLED: "Bekor qilindi"
};

export const paymentMethods = ["CASH", "CARD_ON_DELIVERY", "CARD_TRANSFER", "WALLET", "BANK_TRANSFER", "ONLINE_PAYME"] as const;
export type PaymentMethodValue = (typeof paymentMethods)[number];
export const paymentStatuses = ["PENDING", "AWAITING_CONFIRMATION", "AWAITING_PAYMENT", "PAID", "REFUND_DUE", "REFUNDED"] as const;
export type PaymentStatusValue = (typeof paymentStatuses)[number];
/** Methods that take the money before delivery, so the order total must be known. */
export const prepaidMethods: readonly PaymentMethodValue[] = ["CARD_TRANSFER", "WALLET", "BANK_TRANSFER", "ONLINE_PAYME"];

export const paymentMethodLabels: Record<string, string> = {
  CASH: "Naqd pul (qabul qilganda)",
  CARD_ON_DELIVERY: "Karta (kuryerga, terminal orqali)",
  CARD_TRANSFER: "Kartaga o‘tkazma",
  WALLET: "Tecsecure hamyoni",
  BANK_TRANSFER: "Bank o‘tkazmasi (yuridik shaxs)",
  ONLINE_PAYME: "Payme orqali onlayn",
  UNSPECIFIED: "Kelishiladi"
};

export const deliveryMethodLabels: Record<string, string> = {
  EXPRESS: "Shahar ichida kuryer",
  COURIER: "Viloyatga kuryer yoki pochta",
  PICKUP: "Olib ketish",
  AGREED: "Telefonda kelishiladi"
};

const transitions: Record<OrderStatusValue, OrderStatusValue[]> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: []
};

export function canTransition(from: OrderStatusValue, to: OrderStatusValue): boolean {
  return transitions[from].includes(to);
}

export function nextStatuses(from: OrderStatusValue): OrderStatusValue[] {
  return transitions[from];
}

// Uzbekistan bounding box (generous) so coordinates cannot be arbitrary values.
export const orderSchema = z.object({
  recipientName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().max(300).optional().default(""),
  latitude: z.number().min(37).max(46).nullable().optional(),
  longitude: z.number().min(55).max(74).nullable().optional(),
  note: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(paymentMethods),
  paymentReference: z.string().trim().max(160).optional(),
  paymentProofMediaId: z.string().cuid().optional(),
  customerType: z.enum(["INDIVIDUAL", "COMPANY"]).default("INDIVIDUAL"),
  companyName: z.string().trim().max(160).optional(),
  companyTin: z.string().trim().optional(),
  expectedProducts: z.array(z.object({
    id: z.string().cuid(),
    priceMinor: z.number().int().nonnegative().nullable(),
    currency: z.string().length(3),
    stockStatus: z.enum(["IN_STOCK", "ON_REQUEST", "OUT_OF_STOCK", "UNKNOWN"])
  })).max(50).optional(),
  region: z.enum(regionCodes).optional(),
  deliveryMethod: z.enum(deliveryMethods).optional(),
  /** What the customer was shown; a different server figure means prices moved and they must look again. */
  expectedDeliveryFeeMinor: z.number().int().nonnegative().nullable().optional(),
  expectedTotalMinor: z.number().int().nonnegative().nullable().optional(),
  items: z
    .array(z.object({ productId: z.string().min(1).max(40), quantity: z.number().int().min(1).max(999) }))
    .min(1)
    .max(50)
}).superRefine((order, context) => {
  if (order.paymentMethod === "CARD_TRANSFER" && !order.paymentProofMediaId) {
    context.addIssue({ code: "custom", path: ["paymentProofMediaId"], message: "To‘lov chekini yuklang." });
  }
  if (order.customerType === "COMPANY") {
    if (!order.companyName || order.companyName.length < 2) context.addIssue({ code: "custom", path: ["companyName"], message: "Kompaniya nomini kiriting." });
    if (!order.companyTin || !/^\d{9}$/.test(order.companyTin)) context.addIssue({ code: "custom", path: ["companyTin"], message: "STIR 9 ta raqamdan iborat bo‘lishi kerak." });
  }
  if (order.paymentMethod === "BANK_TRANSFER" && order.customerType !== "COMPANY") {
    context.addIssue({ code: "custom", path: ["paymentMethod"], message: "Bank o‘tkazmasi yuridik shaxslar uchun." });
  }
  // Collecting it in person needs no address.
  if (order.deliveryMethod === "PICKUP") return;
  const hasCoordinates = order.latitude != null && order.longitude != null;
  const hasManualLocation = order.address.length >= 5 || (order.note?.trim().length ?? 0) >= 5;
  if (!hasCoordinates && !hasManualLocation) {
    context.addIssue({
      code: "custom",
      path: ["address"],
      message: "Xaritadan joy tanlang yoki manzilni izohga kiriting."
    });
  }
});

export const orderStatusSchema = z.object({
  status: z.enum(orderStatuses),
  note: z.string().trim().max(300).optional()
});

export function mergeItems(items: { productId: string; quantity: number }[]) {
  const map = new Map<string, number>();
  for (const item of items) map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
  return [...map.entries()].map(([productId, quantity]) => ({ productId, quantity: Math.min(quantity, 999) }));
}
