export type SellerProduct = {
  id: string; name: string; slug: string; description: string; categoryId: string | null; brand: string | null; model: string | null; sku: string | null;
  priceMinor: number | null; currency: string; stockQuantity: number | null; stockStatus: string; warrantyDescription: string | null;
  specifications: Record<string, string | number | boolean> | null; media: string[] | null;
  translations: { ru?: { name?: string; description?: string }; en?: { name?: string; description?: string } } | null;
  status: string; moderation: string; moderationNote: string | null; sellerHidden: boolean; promotedUntil: string | null; viewCount: number;
  createdAt: string; updatedAt: string; category: { name: string } | null; sold: number;
};

export type SellerOrder = {
  id: string; status: string; itemsTotalMinor: number | null; commissionPercent: number; commissionMinor: number | null; deliveryShareMinor: number | null; payoutMinor: number | null;
  sellerNote: string | null; creditedAt: string | null; createdAt: string; confirmedAt: string | null; shippedAt: string | null; deliveredAt: string | null; cancelledAt: string | null;
  order: {
    id: string; reference: string; status: string; paymentStatus: string; paymentMethod: string; recipientName: string; phone: string; city: string; address: string;
    region: string | null; deliveryMethod: string | null; note: string | null; latitude: number | null; longitude: number | null; createdAt: string;
    items: { id: string; name: string; quantity: number; unitPriceMinor: number | null; productId: string | null }[];
  };
};

export type SellerOverview = {
  shop: { name: string; slug: string; commissionPercent: number; referralCommissionPercent: number; notifyOrders: boolean };
  orders: { toAccept: number; awaitingPayment: number; toShip: number; shipped: number; delivered: number };
  money: { balanceMinor: number; pendingMinor: number; earned30Minor: number };
  products: {
    onSale: number; inReview: number; rejected: number; hidden: number; advertised: number; views: number;
    lowStock: { id: string; name: string; left: number | null }[]; outOfStock: { id: string; name: string }[];
    topViewed: { id: string; name: string; views: number }[]; topSold: { id: string; name: string; sold: number }[];
  };
  promotion: { pricePerDayMinor: number | null; maxDays: number };
};

export type ProductState = "sale" | "review" | "rejected" | "hidden" | "out";

/** One word for where a listing stands, in the order a seller cares about. */
export function productState(product: Pick<SellerProduct, "moderation" | "sellerHidden" | "stockStatus" | "status">): ProductState {
  if (product.moderation === "REJECTED") return "rejected";
  if (product.moderation === "PENDING") return "review";
  if (product.sellerHidden) return "hidden";
  if (product.stockStatus === "OUT_OF_STOCK") return "out";
  return "sale";
}

export type Screen =
  | { kind: "tab" }
  | { kind: "order"; id: string }
  | { kind: "product"; id: string }
  | { kind: "editor"; id: string | null }
  | { kind: "profile" };
