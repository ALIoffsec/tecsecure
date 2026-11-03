import { CartCheckout } from "@/components/cart-checkout";
import { getCurrentUser } from "@/lib/auth";
import { ShopText } from "@/components/shop-text";

export const metadata = { title: "Savat | Tecsecure" };

export default async function CartPage() {
  const user = await getCurrentUser();
  return <div className="container page-shell">
    <span className="eyebrow">Tecsecure</span>
    <h1 className="page-title"><ShopText id="cart" /></h1>
    <CartCheckout canOrder={user?.role === "CUSTOMER"} />
  </div>;
}
