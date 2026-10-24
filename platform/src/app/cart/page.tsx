import { CartCheckout } from "@/components/cart-checkout";

export const metadata = { title: "Savat | Tecsecure" };

export default function CartPage() {
  return <div className="container page-shell" style={{ maxWidth: 850 }}>
    <span className="eyebrow">Buyurtma</span>
    <h1 className="page-title">Savat va yetkazib berish</h1>
    <CartCheckout />
  </div>;
}
