import { CartCheckout } from "@/components/cart-checkout";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCompanyRequisites, getPaymentCard } from "@/lib/payment-card";
import { paymeConfigured } from "@/lib/payme";
import { ShopText } from "@/components/shop-text";

export const metadata = { title: "Savat | Tecsecure" };

export default async function CartPage() {
  const user = await getCurrentUser();
  const [account, paymentCard, requisites] = await Promise.all([
    user?.role === "CUSTOMER" ? prisma.user.findUnique({ where: { id: user.id }, select: { name: true, phone: true, walletBalanceMinor: true } }) : null,
    getPaymentCard(),
    getCompanyRequisites()
  ]);
  return <div className="container page-shell">
    <span className="eyebrow">Tecsecure</span>
    <h1 className="page-title"><ShopText id="cart" /></h1>
    <CartCheckout canOrder={user?.role === "CUSTOMER"} signedIn={Boolean(user)} customer={account} walletBalance={account?.walletBalanceMinor ?? 0} paymentCard={paymentCard} paymeEnabled={paymeConfigured()} bankEnabled={Boolean(requisites)} />
  </div>;
}
