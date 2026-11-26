/** What stops an account from being closed. Pure, so it is tested without a database. */

export type DeletionBlocker =
  | "WALLET_BALANCE" | "WALLET_PENDING" | "ORDER_OPEN" | "ORDER_PAYMENT_OPEN" | "DISPUTE_OPEN" | "INVOICE_UNPAID"
  | "PAYMENT_PENDING" | "PROJECT_ACTIVE" | "SHOP_OPEN" | "ORGANIZATION_SOLE_OWNER" | "PAYME_PENDING";

export type DeletionCounts = {
  walletBalanceMinor: number; pendingWallet: number; openOrders: number; openPayments: number; openDisputes: number;
  unpaidInvoices: number; pendingPayments: number; activeProjects: number;
  shopBalanceMinor: number; shopPayouts: number; shopOpenParts: number; soleOwner: boolean; paymePending: number;
};

/** Every reason at once, so the person sees the whole list instead of one at a time. TEC points never block. */
export function deletionBlockers(counts: DeletionCounts): DeletionBlocker[] {
  const blockers: DeletionBlocker[] = [];
  if (counts.walletBalanceMinor !== 0) blockers.push("WALLET_BALANCE");
  if (counts.pendingWallet > 0) blockers.push("WALLET_PENDING");
  if (counts.openOrders > 0) blockers.push("ORDER_OPEN");
  if (counts.openPayments > 0) blockers.push("ORDER_PAYMENT_OPEN");
  if (counts.openDisputes > 0) blockers.push("DISPUTE_OPEN");
  if (counts.unpaidInvoices > 0) blockers.push("INVOICE_UNPAID");
  if (counts.pendingPayments > 0) blockers.push("PAYMENT_PENDING");
  if (counts.activeProjects > 0) blockers.push("PROJECT_ACTIVE");
  if (counts.shopBalanceMinor !== 0 || counts.shopPayouts > 0 || counts.shopOpenParts > 0) blockers.push("SHOP_OPEN");
  if (counts.soleOwner) blockers.push("ORGANIZATION_SOLE_OWNER");
  if (counts.paymePending > 0) blockers.push("PAYME_PENDING");
  return blockers;
}

/** Each reason with where to sort it out. */
export const deletionBlockerText: Record<"uz" | "ru" | "en", Record<DeletionBlocker, { text: string; href: string }>> = {
  uz: {
    WALLET_BALANCE: { text: "Hamyonda pul bor: avval uni yeching.", href: "/portal/profile?section=wallet" },
    WALLET_PENDING: { text: "Hamyon so‘rovi ko‘rib chiqilmoqda.", href: "/portal/profile?section=wallet" },
    ORDER_OPEN: { text: "Yakunlanmagan buyurtma bor.", href: "/portal/orders" },
    ORDER_PAYMENT_OPEN: { text: "Buyurtma to‘lovi tekshirilmoqda yoki pul qaytarilishi kerak.", href: "/portal/orders" },
    DISPUTE_OPEN: { text: "Ochiq murojaat bor.", href: "/portal/orders" },
    INVOICE_UNPAID: { text: "To‘lanmagan hisob bor.", href: "/portal/profile?section=requests" },
    PAYMENT_PENDING: { text: "To‘lov tekshirilmoqda.", href: "/portal/profile?section=requests" },
    PROJECT_ACTIVE: { text: "Faol loyiha bor.", href: "/portal/profile?section=requests" },
    SHOP_OPEN: { text: "Do‘koningizda balans, pul yechish so‘rovi yoki ochiq buyurtma bor.", href: "/shop" },
    ORGANIZATION_SOLE_OWNER: { text: "Siz tashkilotning yagona egasisiz: avval boshqa egani qo‘shing.", href: "/portal/profile?section=monitoring" },
    PAYME_PENDING: { text: "Payme to‘lovi yakunlanmagan.", href: "/portal/orders" }
  },
  ru: {
    WALLET_BALANCE: { text: "В кошельке есть деньги: сначала выведите их.", href: "/portal/profile?section=wallet" },
    WALLET_PENDING: { text: "Заявка кошелька на рассмотрении.", href: "/portal/profile?section=wallet" },
    ORDER_OPEN: { text: "Есть незавершённый заказ.", href: "/portal/orders" },
    ORDER_PAYMENT_OPEN: { text: "Оплата заказа проверяется или нужен возврат.", href: "/portal/orders" },
    DISPUTE_OPEN: { text: "Есть открытое обращение.", href: "/portal/orders" },
    INVOICE_UNPAID: { text: "Есть неоплаченный счёт.", href: "/portal/profile?section=requests" },
    PAYMENT_PENDING: { text: "Платёж проверяется.", href: "/portal/profile?section=requests" },
    PROJECT_ACTIVE: { text: "Есть активный проект.", href: "/portal/profile?section=requests" },
    SHOP_OPEN: { text: "В вашем магазине есть баланс, заявка на выплату или открытый заказ.", href: "/shop" },
    ORGANIZATION_SOLE_OWNER: { text: "Вы единственный владелец организации: сначала добавьте другого владельца.", href: "/portal/profile?section=monitoring" },
    PAYME_PENDING: { text: "Платёж Payme не завершён.", href: "/portal/orders" }
  },
  en: {
    WALLET_BALANCE: { text: "Your wallet has money in it: withdraw it first.", href: "/portal/profile?section=wallet" },
    WALLET_PENDING: { text: "A wallet request is under review.", href: "/portal/profile?section=wallet" },
    ORDER_OPEN: { text: "An order is not finished yet.", href: "/portal/orders" },
    ORDER_PAYMENT_OPEN: { text: "An order payment is being checked or a refund is due.", href: "/portal/orders" },
    DISPUTE_OPEN: { text: "A complaint is still open.", href: "/portal/orders" },
    INVOICE_UNPAID: { text: "An invoice is unpaid.", href: "/portal/profile?section=requests" },
    PAYMENT_PENDING: { text: "A payment is being checked.", href: "/portal/profile?section=requests" },
    PROJECT_ACTIVE: { text: "A project is in progress.", href: "/portal/profile?section=requests" },
    SHOP_OPEN: { text: "Your shop has a balance, a payout request or an open order.", href: "/shop" },
    ORGANIZATION_SOLE_OWNER: { text: "You are an organisation’s only owner: add another owner first.", href: "/portal/profile?section=monitoring" },
    PAYME_PENDING: { text: "A Payme payment is not finished.", href: "/portal/orders" }
  }
};
