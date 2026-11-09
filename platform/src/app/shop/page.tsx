import { SellerCabinet } from "@/components/seller-cabinet";
import { requireUser } from "@/lib/auth";
import { loadShop } from "@/lib/shop-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Do‘kon kabineti | Tecsecure", robots: { index: false, follow: false } };

export default async function ShopCabinetPage() {
  const user = await requireUser("/shop");
  const staff = user.role !== "CUSTOMER";
  const shop = staff ? null : await loadShop(user.id);
  return <SellerCabinet shop={shop} staff={staff} siteUrl={process.env.NEXT_PUBLIC_APP_URL || "https://tecsecure.uz"} />;
}
