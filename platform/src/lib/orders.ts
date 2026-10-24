import { z } from "zod";

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
  items: z
    .array(z.object({ productId: z.string().min(1).max(40), quantity: z.number().int().min(1).max(999) }))
    .min(1)
    .max(50)
}).superRefine((order, context) => {
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
