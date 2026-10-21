import type { MessageKey } from "@/lib/messages";

export function getProductStockMessageKey(status: string): Extract<MessageKey, "unknown" | "inStock" | "outOfStock" | "onRequest"> {
  if (status === "IN_STOCK") return "inStock";
  if (status === "OUT_OF_STOCK") return "outOfStock";
  if (status === "ON_REQUEST") return "onRequest";
  return "unknown";
}
